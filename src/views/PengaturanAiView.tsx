import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wand2,
  ListChecks,
  Trash2,
  Pencil,
  Plus,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Languages,
  Loader2,
  X,
  Bot,
  Power,
} from 'lucide-react';
import { SchoolProfile } from '../types/supervisi';

interface SavedKeyMeta {
  id: string;
  name: string;
  last4: string;
  model: string;
  isActive: boolean;
  createdAt: string;
  lastTestedAt?: string;
  lastTestStatus?: 'ok' | 'error';
  lastTestMessage?: string;
}

interface ModelCatalogItem {
  id: string;
  label: string;
  tier: 'Gratis / Standar' | 'Pro / Berbayar';
  description: string;
  recommended?: boolean;
}

interface AiPreferences {
  aiEnabled: boolean;
  language: 'ID' | 'EN';
  theme: 'light' | 'dark' | 'system';
}

interface PublicAiSettings {
  ready: boolean;
  hasKey: boolean;
  source: 'stored' | 'env' | 'none';
  hasServerEnvKey: boolean;
  serverEnvLast4: string | null;
  activeKeyId: string | null;
  activeKeyName: string | null;
  activeKeyLast4: string | null;
  activeModel: string;
  maxKeys: number;
  keys: SavedKeyMeta[];
  preferences: AiPreferences;
  availableModels: ModelCatalogItem[];
}

interface PengaturanAiViewProps {
  school: SchoolProfile;
  onOpenAiAssistant?: () => void;
}

export const PengaturanAiView: React.FC<PengaturanAiViewProps> = ({
  school,
  onOpenAiAssistant,
}) => {
  const [settings, setSettings] = useState<PublicAiSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Active API Key & Model form state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelInput, setModelInput] = useState('gemini-4-hydrogen');
  const [showAvailableModels, setShowAvailableModels] = useState(false);

  // Add another key form state
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [setNewKeyActive, setSetNewKeyActive] = useState(false);

  // Edit saved key modal state
  const [editingKey, setEditingKey] = useState<SavedKeyMeta | null>(null);
  const [editKeyName, setEditKeyName] = useState('');
  const [editKeyModel, setEditKeyModel] = useState('');
  const [editKeySecret, setEditKeySecret] = useState('');

  // Status banner
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => {
      setBanner((prev) => (prev?.message === message ? null : prev));
    }, 5500);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai-settings');
      const data = (await res.json()) as PublicAiSettings & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Gagal memuat pengaturan AI.');
      setSettings(data);
      setModelInput(data.activeModel || 'gemini-4-hydrogen');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat pengaturan AI.';
      showBanner('error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveMainKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyAction('save');
    try {
      const res = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim() || undefined,
          model: modelInput.trim(),
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        settings?: PublicAiSettings;
      };
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan.');
      if (data.settings) {
        setSettings(data.settings);
        setModelInput(data.settings.activeModel);
      }
      setApiKeyInput('');
      showBanner('success', data.message || 'Pengaturan API Key & model berhasil disimpan.');
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleTestConnection = async (keyId?: string) => {
    setBusyAction(keyId ? `test-${keyId}` : 'test');
    try {
      const res = await fetch('/api/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId,
          apiKey: !keyId && apiKeyInput.trim() ? apiKeyInput.trim() : undefined,
          model: modelInput.trim(),
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        sampleReply?: string;
        settings?: PublicAiSettings;
      };
      if (data.settings) setSettings(data.settings);
      if (!res.ok) throw new Error(data.error || 'Tes koneksi gagal.');
      showBanner(
        'success',
        `${data.message}${data.sampleReply ? ` — Respons: "${data.sampleReply}"` : ''}`
      );
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Tes koneksi gagal.');
    } finally {
      setBusyAction(null);
    }
  };

  const handlePickBestModel = async () => {
    setBusyAction('pick-best');
    try {
      const res = await fetch('/api/admin/ai-settings/pick-best', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        model?: string;
        message?: string;
        error?: string;
        settings?: PublicAiSettings;
      };
      if (!res.ok) throw new Error(data.error || 'Gagal memilih model terbaik.');
      if (data.settings) setSettings(data.settings);
      if (data.model) setModelInput(data.model);
      showBanner('success', data.message || 'Model terbaik berhasil dipilih.');
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Gagal memilih model terbaik.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleDeleteKey = async (id: string) => {
    setBusyAction(`del-${id}`);
    try {
      const res = await fetch(`/api/admin/ai-settings/keys/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        settings?: PublicAiSettings;
      };
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus key.');
      if (data.settings) {
        setSettings(data.settings);
        setModelInput(data.settings.activeModel);
      }
      showBanner('success', data.message || 'Key berhasil dihapus.');
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Gagal menghapus key.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !newKeyValue.trim()) {
      showBanner('error', 'Nama key dan API Key (AIza...) wajib diisi.');
      return;
    }
    setBusyAction('add-key');
    try {
      const res = await fetch('/api/admin/ai-settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          apiKey: newKeyValue.trim(),
          model: modelInput.trim(),
          setActive: setNewKeyActive,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        settings?: PublicAiSettings;
      };
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan key.');
      if (data.settings) {
        setSettings(data.settings);
        setModelInput(data.settings.activeModel);
      }
      setNewKeyName('');
      setNewKeyValue('');
      setSetNewKeyActive(false);
      showBanner('success', data.message || 'Key baru berhasil ditambahkan.');
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Gagal menambahkan key.');
    } finally {
      setBusyAction(null);
    }
  };

  const handleActivateKey = async (id: string) => {
    setBusyAction(`act-${id}`);
    try {
      const res = await fetch(`/api/admin/ai-settings/keys/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate: true }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        settings?: PublicAiSettings;
      };
      if (!res.ok) throw new Error(data.error || 'Gagal mengaktifkan key.');
      if (data.settings) {
        setSettings(data.settings);
        setModelInput(data.settings.activeModel);
      }
      showBanner('success', data.message || 'Key diaktifkan.');
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Gagal mengaktifkan key.');
    } finally {
      setBusyAction(null);
    }
  };

  const openEditKeyModal = (keyItem: SavedKeyMeta) => {
    setEditingKey(keyItem);
    setEditKeyName(keyItem.name);
    setEditKeyModel(keyItem.model);
    setEditKeySecret('');
  };

  const handleSaveEditKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;
    setBusyAction('edit-key');
    try {
      const res = await fetch(`/api/admin/ai-settings/keys/${encodeURIComponent(editingKey.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editKeyName.trim(),
          model: editKeyModel.trim(),
          apiKey: editKeySecret.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        settings?: PublicAiSettings;
      };
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui key.');
      if (data.settings) {
        setSettings(data.settings);
        setModelInput(data.settings.activeModel);
      }
      setEditingKey(null);
      showBanner('success', data.message || 'Key berhasil diperbarui.');
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Gagal memperbarui key.');
    } finally {
      setBusyAction(null);
    }
  };

  const updatePreferences = async (patch: Partial<AiPreferences>) => {
    setBusyAction('prefs');
    try {
      const res = await fetch('/api/admin/ai-settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        settings?: PublicAiSettings;
      };
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui preferensi.');
      if (data.settings) setSettings(data.settings);
      showBanner('success', data.message || 'Preferensi disimpan.');
    } catch (err: unknown) {
      showBanner('error', err instanceof Error ? err.message : 'Gagal memperbarui preferensi.');
    } finally {
      setBusyAction(null);
    }
  };

  if (loading && !settings) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3 text-xs text-gray-500 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
        <span>Memuat pengaturan integrasi AI &amp; API Key...</span>
      </div>
    );
  }

  const ready = Boolean(settings?.ready);
  const keys = settings?.keys || [];
  const maxKeys = settings?.maxKeys || 10;
  const prefs = settings?.preferences || {
    aiEnabled: true,
    language: 'ID' as const,
    theme: 'light' as const,
  };
  const availableModels = settings?.availableModels || [];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Status Notification Banner */}
      {banner && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-semibold ${
            banner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{banner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="p-0.5 hover:opacity-70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Card 1: Bahasa (adapted from top card in design) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Bahasa Respons AI</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Langsung berlaku untuk AI Asisten Supervisi dan rekomendasi otomatis di aplikasi ini.
            </p>
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-gray-100 border border-gray-200 self-start sm:self-center">
            <span className="pl-2 pr-1 text-gray-500">
              <Languages className="w-3.5 h-3.5" />
            </span>
            {(['EN', 'ID'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                disabled={busyAction === 'prefs'}
                onClick={() => updatePreferences({ language: lang })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  prefs.language === lang
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card 2: Status Akses & Integrasi Sekolah (adapted from Lisensi card in design) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Integrasi AI Terpusat — {school.namaSekolah}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Aplikasi terhubung ke server Gemini AI secara terpusat. API Key yang diatur di sini mengaktifkan fitur{' '}
              <span className="font-semibold text-emerald-900">AI Asisten Supervisi</span>,{' '}
              <span className="font-semibold text-emerald-900">Saran Observasi KBM</span>, dan{' '}
              <span className="font-semibold text-emerald-900">Coaching Pasca-Observasi</span>{' '}
              untuk seluruh pengguna tanpa mengekspos key ke browser.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            disabled={busyAction === 'prefs'}
            onClick={() => updatePreferences({ aiEnabled: !prefs.aiEnabled })}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              prefs.aiEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{prefs.aiEnabled ? 'AI Aktif' : 'AI Nonaktif'}</span>
          </button>

          {onOpenAiAssistant && (
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-300" />
              <span>Buka AI Asisten</span>
            </button>
          )}
        </div>
      </div>

      {/* Card 3: API key Gemini kamu (Core Card matching attached design) */}
      <form
        onSubmit={handleSaveMainKey}
        className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">API key Gemini kamu</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Gratis dari Google AI Studio. Seluruh fitur AI Supervisi berjalan memakai key sekolah Anda secara privat di server.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
              ready
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : !prefs.aiEnabled
                ? 'bg-gray-100 text-gray-600 border-gray-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {ready ? 'Siap' : !prefs.aiEnabled ? 'Dinonaktifkan' : 'Perlu API Key'}
            </span>
          </span>
        </div>

        {/* API Key Input */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1.5">API key</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Kosongkan untuk tetap memakai key tersimpan"
              autoComplete="off"
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((prev) => !prev)}
              title={showApiKey ? 'Sembunyikan API Key' : 'Tampilkan API Key'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            {settings?.activeKeyLast4 ? (
              <>
                Tersimpan:{' '}
                <span className="font-mono font-bold text-gray-800">
                  •••• {settings.activeKeyLast4}
                </span>{' '}
                <span className="text-gray-400">
                  ({settings.source === 'stored' ? settings.activeKeyName : 'Environment Server'})
                </span>
              </>
            ) : (
              'Belum ada API key tersimpan. Masukkan key Google AI Studio (AIza...) lalu klik Simpan.'
            )}
          </p>
        </div>

        {/* Model Input */}
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-1.5">Model</label>
          <input
            type="text"
            list="gemini-model-suggestions"
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            placeholder="gemini-4-hydrogen"
            className="w-full px-3.5 py-2.5 text-xs bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono font-semibold text-gray-900"
          />
          <datalist id="gemini-model-suggestions">
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.tier})
              </option>
            ))}
          </datalist>
          <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
            Kosongkan saja — waktu disimpan, model terbaik yang bisa dipakai keymu dipilih otomatis (default:{' '}
            <span className="font-mono font-semibold text-emerald-800">gemini-4-hydrogen</span>). Untuk penalaran lebih dalam pada akun Pro, pilih{' '}
            <span className="font-mono font-semibold">gemini-4-argon</span> atau{' '}
            <span className="font-mono font-semibold">gemini-4-carbon</span>.
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={busyAction !== null}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] hover:bg-[#033c2a] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {busyAction === 'save' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => handleTestConnection()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {busyAction === 'test' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>Tes</span>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={handlePickBestModel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {busyAction === 'pick-best' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>Pilihkan yang terbaik</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAvailableModels((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 border text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                showAvailableModels
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 text-emerald-700" />
              <span>Model yang bisa dipakai</span>
            </button>
          </div>

          {settings?.activeKeyId && (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => handleDeleteKey('active')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          )}
        </div>

        {/* Available Models Drawer */}
        {showAvailableModels && (
          <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900">
                Daftar Model Gemini yang Didukung Aplikasi
              </span>
              <button
                type="button"
                onClick={() => setShowAvailableModels(false)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableModels.map((m) => {
                const isSelected = modelInput.trim() === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setModelInput(m.id);
                      setShowAvailableModels(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-gray-900">{m.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.recommended
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {m.recommended ? 'Direkomendasikan' : m.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">{m.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>

      {/* Card 4: Key tersimpan (N dari 10) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Key tersimpan ({keys.length} dari {maxKeys})
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Simpan key dari beberapa akun Google, misalnya milik Sekolah, Kepala Sekolah, atau Tim Pengembang Kurikulum. Key aktif dipakai untuk seluruh layanan AI Supervisi; menghapus key tidak merusak aplikasi karena sistem otomatis memakai key aktif lain atau cadangan server.
          </p>
        </div>

        {/* Saved Keys List */}
        <div className="space-y-2.5">
          {keys.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-xs text-gray-500 text-center">
              Belum ada key kustom tersimpan.
              {settings?.hasServerEnvKey
                ? ` Saat ini sistem memakai cadangan server (•••• ${settings.serverEnvLast4}).`
                : ' Tambahkan key melalui form di bawah.'}
            </div>
          ) : (
            keys.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  item.isActive
                    ? 'bg-emerald-50/35 border-emerald-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50/50'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{item.name}</span>
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busyAction !== null}
                        onClick={() => handleActivateKey(item.id)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer"
                      >
                        Jadikan Aktif
                      </button>
                    )}

                    {item.lastTestStatus === 'ok' && item.lastTestMessage && (
                      <span className="text-[10px] font-semibold text-emerald-700">
                        • {item.lastTestMessage}
                      </span>
                    )}
                    {item.lastTestStatus === 'error' && (
                      <span className="text-[10px] font-semibold text-red-600">
                        • Tes Gagal
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                    •••• {item.last4} · {item.model}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    disabled={busyAction !== null}
                    onClick={() => handleTestConnection(item.id)}
                    title="Tes Koneksi Key Ini"
                    className="p-2 border border-gray-200 bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-800 rounded-xl transition-colors cursor-pointer"
                  >
                    {busyAction === `test-${item.id}` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={busyAction !== null}
                    onClick={() => openEditKeyModal(item)}
                    title="Edit Nama & Model Key"
                    className="p-2 border border-gray-200 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={busyAction !== null}
                    onClick={() => handleDeleteKey(item.id)}
                    title="Hapus Key Ini"
                    className="p-2 border border-red-200 bg-white hover:bg-red-50 text-red-500 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sub-box: Tambah key lain */}
        <form
          onSubmit={handleAddKey}
          className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-3"
        >
          <div className="text-xs font-bold text-gray-800">Tambah key lain</div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Nama, misal Key Utama Sekolah"
              className="sm:col-span-4 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <input
              type="password"
              value={newKeyValue}
              onChange={(e) => setNewKeyValue(e.target.value)}
              placeholder="AIza..."
              autoComplete="off"
              className="sm:col-span-8 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={setNewKeyActive}
                onChange={(e) => setSetNewKeyActive(e.target.checked)}
                className="w-3.5 h-3.5 accent-emerald-700 rounded"
              />
              <span>Langsung jadikan key aktif</span>
            </label>

            <button
              type="submit"
              disabled={busyAction !== null || keys.length >= maxKeys}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] hover:bg-[#033c2a] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {busyAction === 'add-key' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Tambah key</span>
            </button>
          </div>
        </form>

        <p className="text-[11px] text-gray-500">
          Key dienkripsi di server dan tidak pernah dikirim balik ke browser — yang ditampilkan hanya empat karakter terakhirnya.
        </p>
      </div>

      {/* Card 5: Tampilan (adapted from bottom card in design) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Tampilan</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Preferensi mode tampilan panel kerja Admin &amp; AI Asisten Supervisi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'light' as const, label: 'Terang', icon: Sun },
            { id: 'dark' as const, label: 'Gelap', icon: Moon },
            { id: 'system' as const, label: 'Ikuti sistem', icon: Monitor },
          ].map((opt) => {
            const Icon = opt.icon;
            const active = prefs.theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={busyAction === 'prefs'}
                onClick={() => updatePreferences({ theme: opt.id })}
                className={`py-3.5 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-gray-500'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal: Edit Saved Key */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-5 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Edit Key Tersimpan</h3>
                <p className="text-[11px] text-emerald-100">
                  Perbarui nama label, model, atau ganti secret API key (•••• {editingKey.last4})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="p-1 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditKey} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Key *</label>
                <input
                  type="text"
                  required
                  value={editKeyName}
                  onChange={(e) => setEditKeyName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Model Default</label>
                <input
                  type="text"
                  list="gemini-model-suggestions"
                  value={editKeyModel}
                  onChange={(e) => setEditKeyModel(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Ganti API Key (Opsional)
                </label>
                <input
                  type="password"
                  value={editKeySecret}
                  onChange={(e) => setEditKeySecret(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengganti key"
                  autoComplete="off"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingKey(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busyAction !== null}
                  className="px-4 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
