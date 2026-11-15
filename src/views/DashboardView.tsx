import React from 'react';
import {
  Users,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileText,
  AlertCircle,
  PlusCircle,
  Printer,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  Teacher,
  VisitationSchedule,
  SupervisiPembelajaranRecord,
  TelaahAdmRecord,
  User,
  SchoolProfile
} from '../types/supervisi';
import { NavTab } from '../components/Sidebar';

interface DashboardViewProps {
  teachers: Teacher[];
  schedules: VisitationSchedule[];
  supervisiKBM: SupervisiPembelajaranRecord[];
  telaahAdm: TelaahAdmRecord[];
  currentUser: User;
  school: SchoolProfile;
  setActiveTab: (tab: NavTab) => void;
  onOpenAiAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  teachers,
  schedules,
  supervisiKBM,
  telaahAdm,
  currentUser,
  school,
  setActiveTab,
  onOpenAiAssistant,
}) => {
  const completedSupervisi = schedules.filter((s) => s.status === 'Selesai').length;
  const scheduledCount = schedules.filter((s) => s.status === 'Terjadwal').length;

  // Average score calculation
  const allScores = supervisiKBM.map((s) => s.nilaiAkhir);
  const avgScore = allScores.length
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 92;

  // Predicate counts
  const amatBaikCount = supervisiKBM.filter((s) => s.nilaiAkhir >= 91).length;
  const baikCount = supervisiKBM.filter((s) => s.nilaiAkhir >= 81 && s.nilaiAkhir < 91).length;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#033c2a] via-[#064e3b] to-[#043b2c] p-6 text-white shadow-lg border border-emerald-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Sistem Penjaminan Mutu Akademik Berkelanjutan</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang di Super Guru Apps
            </h2>
            <p className="text-emerald-100/90 text-sm mt-1 max-w-2xl leading-relaxed">
              Portal supervisi akademik terpadu <span className="font-semibold text-white">{school.namaSekolah}</span>. 
              Mendukung implementasi Kurikulum Merdeka, telaah modul ajar, observasi kelas interaktif, dan tindak lanjut coaching.
            </p>
          </div>

          {currentUser.role !== 'kepala_sekolah' && (
            <div className="flex flex-wrap items-center gap-2.5">
              {currentUser.role === 'admin' ? (
                <button
                  onClick={() => setActiveTab('data_guru')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#022c1e] rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
                >
                  <Users className="w-4 h-4" />
                  <span>Kelola Data Guru</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('supervisi_pembelajaran')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#022c1e] rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Mulai Observasi KBM</span>
                </button>
              )}
              <button
                onClick={() => setActiveTab('laporan_supervisi')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          )}
        </div>

        {/* Background decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-teal-400/10 blur-xl pointer-events-none" />
      </div>

      {/* Role specific notification banner */}
      {currentUser.role === 'guru' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-900">
            <span className="font-bold">Mode Guru Aktif:</span> Anda dapat mengunggah berkas administrasi perencanaan, melihat jadwal kunjungan kelas supervisor, mengisi lembar refleksi pra/pasca observasi, serta meninjau umpan balik pembinaan dari Kepala Sekolah.
          </div>
        </div>
      )}

      {/* Statistics 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teachers */}
        <div
          onClick={() => setActiveTab('data_guru')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Dewan Guru
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{teachers.length}</span>
            <span className="text-xs font-semibold text-emerald-600">Pendidik Aktif</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-400 font-medium group-hover:text-emerald-700">
            <span>Kelola data & mapel</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </div>
        </div>

        {/* Completed Supervision */}
        <div
          onClick={() => setActiveTab('hasil_supervisi')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Supervisi Terlaksana
            </span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{completedSupervisi}</span>
            <span className="text-xs text-gray-500 font-medium">/ {teachers.length} Guru</span>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-teal-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (completedSupervisi / teachers.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Average Score */}
        <div
          onClick={() => setActiveTab('hasil_supervisi')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Rata-rata Nilai
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{avgScore}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              Amat Baik
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-400 font-medium group-hover:text-amber-700">
            <span>Standar mutu tercapai</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </div>
        </div>

        {/* Scheduled Visitation */}
        <div
          onClick={() => setActiveTab('jadwal_visitasi')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Visitasi Terjadwal
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{scheduledCount}</span>
            <span className="text-xs font-semibold text-purple-600">Sesi Mendatang</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-400 font-medium group-hover:text-purple-700">
            <span>Lihat agenda kelas</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto" />
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Visitation & Supervision Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Schedules & Quick Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Visitations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Agenda Visitasi & Kunjungan Kelas
                </h3>
                <p className="text-xs text-gray-500">
                  Jadwal observasi proses belajar mengajar tatap muka
                </p>
              </div>
              <button
                onClick={() => setActiveTab('jadwal_visitasi')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {schedules.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      {item.mapel.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-gray-900">{item.guruNama}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold">
                          {item.kelas}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Mata Pelajaran: <span className="font-semibold text-gray-700">{item.mapel}</span>
                      </p>
                      <p className="text-[11px] text-gray-600 italic line-clamp-1 mt-0.5">
                        Fokus: {item.fokusObservasi}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <span className="text-xs font-bold text-emerald-800">{item.tanggal}</span>
                    <span className="text-[11px] text-gray-500">{item.jamKe}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mt-0.5 ${
                        item.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Flow Navigator */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Alur Siklus Supervisi Klinis 5 Tahap
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Standar prosedur operasional supervisi akademik SMA Plus UQ Al-Mustofa
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {(currentUser.role === 'admin'
                ? [
                    { no: '1', title: 'Data Pendidik', sub: 'Kelola Dewan Guru', tab: 'data_guru' as NavTab },
                    { no: '2', title: 'Perencanaan', sub: 'Program & Agenda', tab: 'program_supervisi' as NavTab },
                    { no: '3', title: 'Jadwal Visitasi', sub: 'Agenda Kunjungan', tab: 'jadwal_visitasi' as NavTab },
                    { no: '4', title: 'Administrasi', sub: 'Verifikasi Berkas', tab: 'administrasi_guru' as NavTab },
                    { no: '5', title: 'Hasil & Laporan', sub: 'Rekapitulasi Mutu', tab: 'hasil_supervisi' as NavTab },
                  ]
                : [
                    { no: '1', title: 'Perencanaan', sub: 'Program & Jadwal', tab: 'program_supervisi' as NavTab },
                    { no: '2', title: 'Telaah Dokumen', sub: 'ATP & Modul Ajar', tab: 'telaah_modul' as NavTab },
                    { no: '3', title: 'Pra-Observasi', sub: 'Fokus & Strategi', tab: 'pra_observasi' as NavTab },
                    { no: '4', title: 'KBM Kelas', sub: 'Observasi Nyata', tab: 'supervisi_pembelajaran' as NavTab },
                    { no: '5', title: 'Pasca & RTL', sub: 'Refleksi & Coaching', tab: 'pasca_observasi' as NavTab },
                  ]
              ).map((step) => (
                <button
                  key={step.no}
                  onClick={() => setActiveTab(step.tab)}
                  className="p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {step.no}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 leading-tight group-hover:text-emerald-800">
                      {step.title}
                    </h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">{step.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: School Profile Quick Info & AI Assistant Card */}
        <div className="space-y-6">
          {/* AI Helper Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 p-5 text-white shadow-md border border-emerald-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h4 className="font-bold text-sm">AI Asisten Supervisi</h4>
            </div>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Manfaatkan kecerdasan buatan untuk merumuskan catatan umpan balik observasi kelas, analisis diferensiasi modul ajar, dan rekomendasi tindak lanjut pembinaan guru.
            </p>
            <button
              onClick={onOpenAiAssistant}
              className="mt-3.5 w-full py-2 px-3 rounded-xl bg-white text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
            >
              <span>Konsultasi AI Supervisi</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* School Identity Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Identitas Satuan Pendidikan
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-lg">
                UQ
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-gray-900">{school.namaSekolah}</h5>
                <p className="text-xs text-gray-500">NPSN: {school.npsn} • Akreditasi {school.akreditasi}</p>
              </div>
            </div>

            <div className="text-xs space-y-2 border-t border-gray-100 pt-3 text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Kepala Sekolah:</span>
                <span className="font-semibold text-gray-900 text-right">{school.kepalaSekolah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pengawas Pembina:</span>
                <span className="font-semibold text-gray-900 text-right">{school.pengawasPembina}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Kurikulum:</span>
                <span className="font-semibold text-emerald-700 text-right">{school.kurikulum}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('profil_sekolah')}
              className="w-full py-2 rounded-xl border border-gray-200 hover:border-emerald-500 text-xs font-semibold text-gray-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              Buka Profil Lengkap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
