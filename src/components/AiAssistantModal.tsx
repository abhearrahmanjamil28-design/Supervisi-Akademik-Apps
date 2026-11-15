import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Copy,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  BookOpen
} from 'lucide-react';
import { Teacher, SchoolProfile } from '../types/supervisi';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolProfile;
  teachers: Teacher[];
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  school,
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Halo Bapak/Ibu! Saya **AI Asisten Supervisi Akademik** untuk **${school.namaSekolah}**.\n\nSaya siap membantu Kepala Sekolah dan Tim Pengembang Kurikulum dalam:\n1. Menyusun catatan umpan balik kualitatif observasi KBM\n2. Merumuskan pertanyaan coaching reflektif pasca-observasi\n3. Menganalisis strategi diferensiasi modul ajar Kurikulum Merdeka\n4. Merancang program tindak lanjut (Bimtek, tutor sebaya, workshop)\n\nSilakan pilih salah satu contoh cepat di bawah atau tulis pertanyaan Anda!`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Buatkan draf umpan balik observasi kelas untuk guru Fisika yang sangat baik dalam pemanfaatan simulasi digital.',
    'Rancang pertanyaan coaching reflektif pasca-observasi untuk menggali kendala manajemen waktu guru.',
    'Berikan rekomendasi rencana tindak lanjut (RTL) bagi guru Matematika dengan pendekatan tutor sebaya.',
    'Bagaimana rubrik penilaian untuk modul ajar Kurikulum Merdeka yang memuat diferensiasi konten dan proses?'
  ];

  const getFallbackRecommendation = (userText: string) => {
    if (userText.toLowerCase().includes('umpan balik') || userText.toLowerCase().includes('fisika')) {
      return `### Draf Catatan Umpan Balik Observasi KBM (Fisika)\n\n**Apresiasi Praktik Baik:**\n- Penggunaan simulasi virtual PhET terbukti sangat efektif mengubah konsep termodinamika yang abstrak menjadi konkret dan visual bagi murid.\n- Pola komunikasi dua arah sangat hangat, guru memberikan penguatan positif atas setiap argumen peserta didik.\n\n**Saran Konstruktif Penguatan:**\n1. *Scaffolding Berjenjang:* Sediakan lembar ringkasan rumus kunci bagi kelompok yang membutuhkan durasi lebih panjang dalam penurunan matematis.\n2. *Timekeeper Visual:* Terapkan hitung mundur digital di proyektor saat sesi diskusi agar presentasi dan refleksi akhir tetap memiliki alokasi waktu ideal.\n\n*Rekomendasi:* Layak menjadi percontohan pembelajaran sains digital pada MGMP Sekolah.`;
    }
    if (userText.toLowerCase().includes('coaching') || userText.toLowerCase().includes('reflektif')) {
      return `### Panduan Pertanyaan Coaching Reflektif Pasca-Observasi:\n\n1. *"Dari proses pembelajaran yang baru saja berlangsung, bagian mana yang menurut Bapak/Ibu paling memuaskan dan berhasil mencapai sasaran?"*\n2. *"Bila dibandingkan dengan rencana di Modul Ajar, apakah ada bagian yang berjalan berbeda dari perkiraan awal? Apa penyebabnya?"*\n3. *"Bagaimana Bapak/Ibu menilai respons dan keterlibatan murid terhadap pertanyaan pemantik yang diberikan?"*\n4. *"Jika diberi kesempatan mengulang kembali sesi tersebut, penyesuaian strategi apa yang ingin Bapak/Ibu lakukan agar alokasi waktu penutup lebih leluasa?"*\n5. *"Dukungan atau media apa yang pihak sekolah dan Kepala Sekolah dapat fasilitasi untuk KBM berikutnya?"*`;
    }
    return `### Rekomendasi Supervisi Akademik ${school.namaSekolah}\n\n1. **Fokus Pengembangan:** Penguatan diferensiasi proses melalui variasi scaffolding pada LKPD.\n2. **Bentuk Pembinaan:** Pelaksanaan peer tutoring (tutor sebaya) berkolaborasi dengan guru serumpun MGMP.\n3. **Indikator Keberhasilan:** Seluruh murid mencapai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) minimal kategori Baik (80+).\n4. **Waktu Implementasi:** 2 pekan ke depan dengan pendampingan berkala dari Wakasek Kurikulum.`;
  };

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || prompt;
    if (!userText.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/supervisi-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          school: {
            namaSekolah: school.namaSekolah,
            kepalaSekolah: school.kepalaSekolah,
            pengawasPembina: school.pengawasPembina,
          },
        }),
      });

      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            text: `⚠️ **Layanan AI belum dapat memproses permintaan:**\n${
              data.error || `Error ${response.status}`
            }\n\n---\n${getFallbackRecommendation(userText)}`,
          },
        ]);
        return;
      }

      const reply = data.text || 'Maaf, tidak dapat menghasilkan jawaban saat ini.';
      setMessages([...newMessages, { role: 'assistant', text: reply }]);
    } catch (err: unknown) {
      console.error('Gemini assistant error:', err);
      const errMsg = err instanceof Error ? err.message : 'Gagal menghubungi server AI.';
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          text: `⚠️ **Koneksi server AI terganggu:** ${errMsg}\n\n---\n${getFallbackRecommendation(
            userText
          )}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col border border-emerald-900/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#033c2a] via-[#064e3b] to-[#043b2c] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>AI Asisten Supervisi Akademik</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">
                Konsultan Pembinaan & Penjaminan Mutu {school.namaSekolah}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-emerald-800 text-white rounded-br-none shadow-xs'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-xs relative group'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">{m.text}</div>

                {m.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(m.text, idx)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Salin Teks"
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs items-center text-gray-500">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="italic">AI sedang menganalisis instrumen dan merumuskan saran...</span>
            </div>
          )}
        </div>

        {/* Quick prompt badges */}
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <div className="text-[11px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
            <span>Pilihan Pertanyaan Cepat:</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="text-[11px] px-2.5 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-900 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {qp.length > 45 ? qp.slice(0, 45) + '...' : qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan rekomendasi supervisi, rubrik, atau umpan balik..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
