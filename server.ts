import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const SETTINGS_FILE = path.resolve(__dirname, '.ai-settings.enc.json');
const MAX_SAVED_KEYS = 10;
const DEFAULT_MODEL = 'gemini-4-hydrogen';

const DEPRECATED_MODELS = new Set([
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-2.0-flash',
  'gemini-2.0-pro',
  'gemini-2.0-flash-thinking',
]);

interface ModelCatalogItem {
  id: string;
  label: string;
  tier: 'Gratis / Standar' | 'Pro / Berbayar';
  description: string;
  recommended?: boolean;
}

const SUPPORTED_MODELS: ModelCatalogItem[] = [
  {
    id: 'gemini-4-hydrogen',
    label: 'Gemini 4 Hydrogen',
    tier: 'Gratis / Standar',
    description:
      'Model utama yang cepat, cerdas, dan direkomendasikan untuk saran observasi KBM, telaah dokumen, dan dialog coaching.',
    recommended: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
    tier: 'Gratis / Standar',
    description:
      'Sangat ringan, latensi rendah, dan hemat kuota untuk ringkasan cepat dan draf umpan balik harian.',
  },
  {
    id: 'gemini-4-argon',
    label: 'Gemini 4 Argon',
    tier: 'Pro / Berbayar',
    description:
      'Penalaran kompleks untuk analisis mendalam perangkat ajar, pemetaan CP/ATP, dan evaluasi asesmen HOTS.',
  },
  {
    id: 'gemini-4-carbon',
    label: 'Gemini 4 Carbon',
    tier: 'Pro / Berbayar',
    description:
      'Kapasitas penalaran tingkat lanjut untuk perumusan program penjaminan mutu akademik sekolah secara komprehensif.',
  },
];

interface StoredKeyRecord {
  id: string;
  name: string;
  encryptedKey: string;
  iv: string;
  authTag: string;
  last4: string;
  model: string;
  createdAt: string;
  lastTestedAt?: string;
  lastTestStatus?: 'ok' | 'error';
  lastTestMessage?: string;
}

interface AiPreferences {
  aiEnabled: boolean;
  language: 'ID' | 'EN';
  theme: 'light' | 'dark' | 'system';
}

interface StoredAiSettings {
  activeKeyId: string | null;
  activeModel: string;
  keys: StoredKeyRecord[];
  preferences: AiPreferences;
}

function getEncryptionKey(): Buffer {
  const seed =
    process.env.AI_SETTINGS_SECRET ||
    `super-guru-apps:${__dirname}:${os.hostname()}:${os.userInfo().username}`;
  return crypto.scryptSync(seed, 'super-guru-ai-salt-v1', 32);
}

function encryptSecret(plaintext: string): {
  encryptedKey: string;
  iv: string;
  authTag: string;
  last4: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const trimmed = plaintext.trim();
  const last4 = trimmed.length >= 4 ? trimmed.slice(-4) : trimmed;
  return {
    encryptedKey: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    last4,
  };
}

function decryptSecret(record: StoredKeyRecord): string | null {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(record.iv, 'base64');
    const authTag = Buffer.from(record.authTag, 'base64');
    const encrypted = Buffer.from(record.encryptedKey, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('Failed to decrypt stored API key:', err);
    return null;
  }
}

function loadSettings(): StoredAiSettings {
  const defaults: StoredAiSettings = {
    activeKeyId: null,
    activeModel: DEFAULT_MODEL,
    keys: [],
    preferences: {
      aiEnabled: true,
      language: 'ID',
      theme: 'light',
    },
  };

  try {
    if (!fs.existsSync(SETTINGS_FILE)) return defaults;
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredAiSettings>;
    return {
      activeKeyId: typeof parsed.activeKeyId === 'string' ? parsed.activeKeyId : null,
      activeModel:
        typeof parsed.activeModel === 'string' && parsed.activeModel.trim()
          ? parsed.activeModel.trim()
          : DEFAULT_MODEL,
      keys: Array.isArray(parsed.keys) ? parsed.keys : [],
      preferences: {
        aiEnabled: parsed.preferences?.aiEnabled ?? true,
        language: parsed.preferences?.language === 'EN' ? 'EN' : 'ID',
        theme:
          parsed.preferences?.theme === 'dark' || parsed.preferences?.theme === 'system'
            ? parsed.preferences.theme
            : 'light',
      },
    };
  } catch {
    return defaults;
  }
}

function saveSettings(settings: StoredAiSettings): void {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), { mode: 0o600 });
}

function normalizeModelName(inputModel?: string): { model: string; error?: string } {
  const raw = (inputModel || '').trim();
  if (!raw || raw.toLowerCase() === 'gemini-flash-latest') {
    return { model: DEFAULT_MODEL };
  }
  if (DEPRECATED_MODELS.has(raw.toLowerCase())) {
    return {
      model: DEFAULT_MODEL,
      error: `Model "${raw}" sudah tidak didukung. Gunakan model aktif seperti "${DEFAULT_MODEL}".`,
    };
  }
  return { model: raw };
}

function createGenAiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getActiveAiCredentials(): {
  apiKey: string | null;
  model: string;
  source: 'stored' | 'env' | 'none';
  activeKeyRecord: StoredKeyRecord | null;
  settings: StoredAiSettings;
} {
  const settings = loadSettings();
  const activeRec = settings.activeKeyId
    ? settings.keys.find((k) => k.id === settings.activeKeyId) || null
    : null;

  if (activeRec) {
    const decrypted = decryptSecret(activeRec);
    if (decrypted) {
      return {
        apiKey: decrypted,
        model: activeRec.model || settings.activeModel || DEFAULT_MODEL,
        source: 'stored',
        activeKeyRecord: activeRec,
        settings,
      };
    }
  }

  const envKey = (process.env.GEMINI_API_KEY || '').trim();
  if (envKey) {
    return {
      apiKey: envKey,
      model: settings.activeModel || DEFAULT_MODEL,
      source: 'env',
      activeKeyRecord: null,
      settings,
    };
  }

  return {
    apiKey: null,
    model: settings.activeModel || DEFAULT_MODEL,
    source: 'none',
    activeKeyRecord: null,
    settings,
  };
}

function buildPublicSettingsResponse() {
  const { apiKey, model, source, activeKeyRecord, settings } = getActiveAiCredentials();
  const envKey = (process.env.GEMINI_API_KEY || '').trim();
  const envLast4 = envKey.length >= 4 ? envKey.slice(-4) : envKey || null;

  return {
    ready: Boolean(apiKey) && settings.preferences.aiEnabled,
    hasKey: Boolean(apiKey),
    source,
    hasServerEnvKey: Boolean(envKey),
    serverEnvLast4: envLast4,
    activeKeyId: activeKeyRecord?.id || null,
    activeKeyName: activeKeyRecord?.name || (envKey ? 'Server Environment Key' : null),
    activeKeyLast4: activeKeyRecord?.last4 || (source === 'env' ? envLast4 : null),
    activeModel: model,
    maxKeys: MAX_SAVED_KEYS,
    keys: settings.keys.map((k) => ({
      id: k.id,
      name: k.name,
      last4: k.last4,
      model: k.model,
      isActive: k.id === settings.activeKeyId,
      createdAt: k.createdAt,
      lastTestedAt: k.lastTestedAt,
      lastTestStatus: k.lastTestStatus,
      lastTestMessage: k.lastTestMessage,
    })),
    preferences: settings.preferences,
    availableModels: SUPPORTED_MODELS,
  };
}

async function testKeyAndModel(apiKey: string, model: string) {
  const start = Date.now();
  const ai = createGenAiClient(apiKey);
  const response = await ai.models.generateContent({
    model,
    contents: 'Balas singkat dengan satu kalimat dalam Bahasa Indonesia: Koneksi AI Supervisi Akademik siap digunakan.',
  });
  const latencyMs = Date.now() - start;
  return {
    ok: true,
    model,
    latencyMs,
    sampleReply: (response.text || 'Koneksi berhasil.').trim(),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Admin AI Settings: Get masked settings
  app.get('/api/admin/ai-settings', (_req, res) => {
    try {
      return res.json(buildPublicSettingsResponse());
    } catch (err) {
      console.error('Error reading AI settings:', err);
      return res.status(500).json({ error: 'Gagal memuat pengaturan AI.' });
    }
  });

  // Admin AI Settings: Save active API key and/or model
  app.post('/api/admin/ai-settings', (req, res) => {
    try {
      const { apiKey, model, name } = (req.body || {}) as {
        apiKey?: string;
        model?: string;
        name?: string;
      };

      const settings = loadSettings();
      const { model: normalizedModel, error: modelError } = normalizeModelName(model);
      if (modelError) {
        return res.status(400).json({ error: modelError });
      }

      const trimmedKey = typeof apiKey === 'string' ? apiKey.trim() : '';

      if (trimmedKey) {
        if (trimmedKey.length < 10) {
          return res.status(400).json({
            error: 'Format API Key tidak valid. Pastikan Anda memasukkan API Key Gemini yang benar.',
          });
        }

        const enc = encryptSecret(trimmedKey);
        const existingActive = settings.activeKeyId
          ? settings.keys.find((k) => k.id === settings.activeKeyId)
          : undefined;

        if (existingActive) {
          existingActive.encryptedKey = enc.encryptedKey;
          existingActive.iv = enc.iv;
          existingActive.authTag = enc.authTag;
          existingActive.last4 = enc.last4;
          existingActive.model = normalizedModel;
          if (name && name.trim()) existingActive.name = name.trim();
          existingActive.lastTestedAt = undefined;
          existingActive.lastTestStatus = undefined;
        } else {
          if (settings.keys.length >= MAX_SAVED_KEYS) {
            return res.status(400).json({
              error: `Maksimal ${MAX_SAVED_KEYS} key tersimpan telah tercapai. Hapus salah satu key terlebih dahulu.`,
            });
          }
          const newId = `key-${Date.now()}`;
          settings.keys.unshift({
            id: newId,
            name: (name && name.trim()) || 'Key utama',
            encryptedKey: enc.encryptedKey,
            iv: enc.iv,
            authTag: enc.authTag,
            last4: enc.last4,
            model: normalizedModel,
            createdAt: new Date().toISOString(),
          });
          settings.activeKeyId = newId;
        }
      } else if (settings.activeKeyId) {
        const existingActive = settings.keys.find((k) => k.id === settings.activeKeyId);
        if (existingActive) {
          existingActive.model = normalizedModel;
        }
      }

      settings.activeModel = normalizedModel;
      saveSettings(settings);

      return res.json({
        message: trimmedKey
          ? 'API Key dan model AI berhasil dienkripsi dan disimpan di server.'
          : 'Pengaturan model AI berhasil diperbarui.',
        settings: buildPublicSettingsResponse(),
      });
    } catch (err) {
      console.error('Error saving AI settings:', err);
      return res.status(500).json({ error: 'Gagal menyimpan pengaturan AI di server.' });
    }
  });

  // Admin AI Settings: Add another named key
  app.post('/api/admin/ai-settings/keys', (req, res) => {
    try {
      const { name, apiKey, model, setActive } = (req.body || {}) as {
        name?: string;
        apiKey?: string;
        model?: string;
        setActive?: boolean;
      };

      const trimmedName = (name || '').trim();
      const trimmedKey = (apiKey || '').trim();

      if (!trimmedName) {
        return res.status(400).json({ error: 'Nama key wajib diisi (misal: Key Sekolah).' });
      }
      if (!trimmedKey || trimmedKey.length < 10) {
        return res.status(400).json({ error: 'API Key Gemini wajib diisi dengan format yang valid.' });
      }

      const settings = loadSettings();
      if (settings.keys.length >= MAX_SAVED_KEYS) {
        return res.status(400).json({
          error: `Batas maksimal ${MAX_SAVED_KEYS} key tersimpan sudah tercapai.`,
        });
      }

      const { model: normalizedModel, error: modelError } = normalizeModelName(
        model || settings.activeModel
      );
      if (modelError) {
        return res.status(400).json({ error: modelError });
      }

      const enc = encryptSecret(trimmedKey);
      const newId = `key-${Date.now()}`;
      settings.keys.push({
        id: newId,
        name: trimmedName,
        encryptedKey: enc.encryptedKey,
        iv: enc.iv,
        authTag: enc.authTag,
        last4: enc.last4,
        model: normalizedModel,
        createdAt: new Date().toISOString(),
      });

      if (setActive || !settings.activeKeyId) {
        settings.activeKeyId = newId;
        settings.activeModel = normalizedModel;
      }

      saveSettings(settings);
      return res.json({
        message: `Key "${trimmedName}" berhasil ditambahkan dan dienkripsi di server.`,
        settings: buildPublicSettingsResponse(),
      });
    } catch (err) {
      console.error('Error adding AI key:', err);
      return res.status(500).json({ error: 'Gagal menambahkan API key baru.' });
    }
  });

  // Admin AI Settings: Activate, rename, or update model of a saved key
  app.patch('/api/admin/ai-settings/keys/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { name, model, activate, apiKey } = (req.body || {}) as {
        name?: string;
        model?: string;
        activate?: boolean;
        apiKey?: string;
      };

      const settings = loadSettings();
      const target = settings.keys.find((k) => k.id === id);
      if (!target) {
        return res.status(404).json({ error: 'Key tidak ditemukan.' });
      }

      if (typeof name === 'string' && name.trim()) {
        target.name = name.trim();
      }
      if (typeof model === 'string') {
        const { model: normalizedModel, error: modelError } = normalizeModelName(model);
        if (modelError) return res.status(400).json({ error: modelError });
        target.model = normalizedModel;
        if (settings.activeKeyId === target.id) {
          settings.activeModel = normalizedModel;
        }
      }
      if (typeof apiKey === 'string' && apiKey.trim()) {
        if (apiKey.trim().length < 10) {
          return res.status(400).json({ error: 'API Key baru tidak valid.' });
        }
        const enc = encryptSecret(apiKey.trim());
        target.encryptedKey = enc.encryptedKey;
        target.iv = enc.iv;
        target.authTag = enc.authTag;
        target.last4 = enc.last4;
      }
      if (activate) {
        settings.activeKeyId = target.id;
        settings.activeModel = target.model || DEFAULT_MODEL;
      }

      saveSettings(settings);
      return res.json({
        message: activate
          ? `Key "${target.name}" diaktifkan.`
          : `Key "${target.name}" berhasil diperbarui.`,
        settings: buildPublicSettingsResponse(),
      });
    } catch (err) {
      console.error('Error updating AI key:', err);
      return res.status(500).json({ error: 'Gagal memperbarui key.' });
    }
  });

  // Admin AI Settings: Delete saved key (or active key)
  app.delete('/api/admin/ai-settings/keys/:id', (req, res) => {
    try {
      const { id } = req.params;
      const settings = loadSettings();

      const targetId = id === 'active' ? settings.activeKeyId : id;
      if (!targetId) {
        return res.status(400).json({ error: 'Tidak ada key tersimpan aktif yang dapat dihapus.' });
      }

      const existing = settings.keys.find((k) => k.id === targetId);
      if (!existing) {
        return res.status(404).json({ error: 'Key tidak ditemukan.' });
      }

      settings.keys = settings.keys.filter((k) => k.id !== targetId);
      if (settings.activeKeyId === targetId) {
        const nextKey = settings.keys[0] || null;
        settings.activeKeyId = nextKey ? nextKey.id : null;
        settings.activeModel = nextKey ? nextKey.model : DEFAULT_MODEL;
      }

      saveSettings(settings);
      return res.json({
        message: `Key "${existing.name}" berhasil dihapus.`,
        settings: buildPublicSettingsResponse(),
      });
    } catch (err) {
      console.error('Error deleting AI key:', err);
      return res.status(500).json({ error: 'Gagal menghapus key.' });
    }
  });

  // Admin AI Settings: Test API Key & Model connection server-side
  app.post('/api/admin/ai-settings/test', async (req, res) => {
    try {
      const { keyId, apiKey, model } = (req.body || {}) as {
        keyId?: string;
        apiKey?: string;
        model?: string;
      };

      const settings = loadSettings();
      const { model: normalizedModel, error: modelError } = normalizeModelName(
        model || settings.activeModel
      );
      if (modelError) {
        return res.status(400).json({ error: modelError });
      }

      let targetKey: string | null = null;
      let targetRecord: StoredKeyRecord | null = null;

      if (typeof apiKey === 'string' && apiKey.trim()) {
        targetKey = apiKey.trim();
      } else if (keyId) {
        targetRecord = settings.keys.find((k) => k.id === keyId) || null;
        if (targetRecord) {
          targetKey = decryptSecret(targetRecord);
        }
      } else {
        const creds = getActiveAiCredentials();
        targetKey = creds.apiKey;
        targetRecord = creds.activeKeyRecord;
      }

      if (!targetKey) {
        return res.status(400).json({
          error: 'Belum ada API Key yang tersedia untuk diuji. Silakan masukkan API Key Gemini terlebih dahulu.',
        });
      }

      try {
        const result = await testKeyAndModel(targetKey, normalizedModel);
        if (targetRecord) {
          targetRecord.lastTestedAt = new Date().toISOString();
          targetRecord.lastTestStatus = 'ok';
          targetRecord.lastTestMessage = `Siap (${result.latencyMs} ms)`;
          saveSettings(settings);
        }
        return res.json({
          ...result,
          message: `Koneksi berhasil! Model "${normalizedModel}" merespons dalam ${result.latencyMs} ms.`,
          settings: buildPublicSettingsResponse(),
        });
      } catch (apiErr: unknown) {
        const errObj = apiErr as { message?: string; status?: number };
        const msg = errObj?.message || 'Gagal terhubung ke Gemini API.';
        if (targetRecord) {
          targetRecord.lastTestedAt = new Date().toISOString();
          targetRecord.lastTestStatus = 'error';
          targetRecord.lastTestMessage = msg;
          saveSettings(settings);
        }
        return res.status(400).json({
          ok: false,
          error: `Tes koneksi gagal: ${msg}`,
          settings: buildPublicSettingsResponse(),
        });
      }
    } catch (err) {
      console.error('Error testing AI settings:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan saat menguji API key.' });
    }
  });

  // Admin AI Settings: Auto-pick best working model
  app.post('/api/admin/ai-settings/pick-best', async (req, res) => {
    try {
      const { apiKey } = (req.body || {}) as { apiKey?: string };
      const creds = getActiveAiCredentials();
      const targetKey = (apiKey || '').trim() || creds.apiKey;

      if (!targetKey) {
        return res.status(400).json({
          error: 'Masukkan atau aktifkan API Key terlebih dahulu untuk memilih model terbaik.',
        });
      }

      const priorityOrder = [
        'gemini-4-hydrogen',
        'gemini-3.1-flash-lite',
        'gemini-4-argon',
      ];

      let chosenModel: string | null = null;
      let latencyMs = 0;

      for (const candidate of priorityOrder) {
        try {
          const result = await testKeyAndModel(targetKey, candidate);
          chosenModel = result.model;
          latencyMs = result.latencyMs;
          break;
        } catch {
          // try next candidate
        }
      }

      if (!chosenModel) {
        return res.status(400).json({
          error: 'Tidak ada model yang dapat diakses menggunakan API Key ini. Periksa kembali key Anda.',
        });
      }

      const settings = loadSettings();
      settings.activeModel = chosenModel;
      if (settings.activeKeyId) {
        const rec = settings.keys.find((k) => k.id === settings.activeKeyId);
        if (rec) {
          rec.model = chosenModel;
          rec.lastTestedAt = new Date().toISOString();
          rec.lastTestStatus = 'ok';
          rec.lastTestMessage = `Dipilih otomatis (${latencyMs} ms)`;
        }
      }
      saveSettings(settings);

      return res.json({
        model: chosenModel,
        latencyMs,
        message: `Model terbaik "${chosenModel}" berhasil dipilih (${latencyMs} ms).`,
        settings: buildPublicSettingsResponse(),
      });
    } catch (err) {
      console.error('Error picking best model:', err);
      return res.status(500).json({ error: 'Gagal memilih model terbaik.' });
    }
  });

  // Admin AI Settings: Get available models list
  app.get('/api/admin/ai-settings/models', (_req, res) => {
    return res.json({ models: SUPPORTED_MODELS });
  });

  // Admin AI Settings: Update preferences (aiEnabled, language, theme)
  app.patch('/api/admin/ai-settings/preferences', (req, res) => {
    try {
      const { aiEnabled, language, theme } = (req.body || {}) as Partial<AiPreferences>;
      const settings = loadSettings();

      if (typeof aiEnabled === 'boolean') {
        settings.preferences.aiEnabled = aiEnabled;
      }
      if (language === 'ID' || language === 'EN') {
        settings.preferences.language = language;
      }
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        settings.preferences.theme = theme;
      }

      saveSettings(settings);
      return res.json({
        message: 'Preferensi AI & tampilan berhasil disimpan.',
        settings: buildPublicSettingsResponse(),
      });
    } catch (err) {
      console.error('Error updating AI preferences:', err);
      return res.status(500).json({ error: 'Gagal menyimpan preferensi.' });
    }
  });

  // Public/App Gemini Endpoint used by AiAssistantModal
  app.post('/api/gemini/supervisi-assistant', async (req, res) => {
    try {
      const { prompt, school } = (req.body || {}) as {
        prompt?: string;
        school?: {
          namaSekolah?: string;
          kepalaSekolah?: string;
          pengawasPembina?: string;
        };
      };

      const userText = typeof prompt === 'string' ? prompt.trim() : '';
      if (!userText) {
        return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' });
      }

      const { apiKey, model, settings } = getActiveAiCredentials();
      if (!settings.preferences.aiEnabled) {
        return res.status(403).json({
          error: 'Integrasi AI sedang dinonaktifkan oleh Admin di menu Pengaturan AI & API Key.',
        });
      }

      if (!apiKey) {
        return res.status(503).json({
          error: 'API Key Gemini belum diatur. Admin dapat menambahkannya di menu Pengaturan AI & API Key.',
        });
      }

      const ai = createGenAiClient(apiKey);
      const namaSekolah = school?.namaSekolah || 'SMA Plus UQ Al-Mustofa';
      const kepalaSekolah = school?.kepalaSekolah || 'Kepala Sekolah';
      const pengawasPembina = school?.pengawasPembina || 'Pengawas Pembina';

      const systemInstruction = `Anda adalah Konsultan Ahli Supervisi Akademik dan Kurikulum Merdeka untuk ${namaSekolah}.
Nama Kepala Sekolah: ${kepalaSekolah}.
Nama Pengawas: ${pengawasPembina}.
Berikan saran yang praktis, suportif, berbasis pendekatan coaching klinis yang memberdayakan guru, profesional, dan menggunakan ${
        settings.preferences.language === 'EN'
          ? 'clear professional English'
          : 'Bahasa Indonesia baku yang santun'
      }.`;

      const response = await ai.models.generateContent({
        model: model || DEFAULT_MODEL,
        contents: userText,
        config: {
          systemInstruction,
        },
      });

      return res.json({
        text: response.text || 'Maaf, tidak dapat menghasilkan jawaban saat ini.',
        model: model || DEFAULT_MODEL,
      });
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      const status =
        typeof errorObj?.status === 'number' && errorObj.status >= 400 && errorObj.status < 600
          ? errorObj.status
          : 500;
      const message =
        errorObj?.message || 'Terjadi kesalahan saat memproses permintaan Gemini API di server.';
      console.error('Server Gemini API error:', err);
      return res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
