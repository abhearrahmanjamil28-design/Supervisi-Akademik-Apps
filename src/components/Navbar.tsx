import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  School,
  Calendar,
  ChevronRight,
  ChevronDown,
  Check,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { User, SchoolProfile, AcademicPeriod } from '../types/supervisi';
import { NavTab } from './Sidebar';

interface NavbarProps {
  activeTab: NavTab;
  school: SchoolProfile;
  onUpdateSchool?: (updated: SchoolProfile) => void;
  academicPeriods?: AcademicPeriod[];
  onUpdateAcademicPeriods?: (periods: AcademicPeriod[]) => void;
  currentUser: User;
  onOpenSwitchRole?: () => void;
  onOpenAiAssistant: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const ACADEMIC_YEAR_OPTIONS = [
  '2024/2025',
  '2025/2026',
  '2026/2027',
  '2027/2028',
  '2028/2029',
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  school,
  onUpdateSchool,
  academicPeriods = [],
  onUpdateAcademicPeriods,
  currentUser,
  onOpenAiAssistant,
  searchQuery,
  setSearchQuery,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        periodDropdownRef.current &&
        !periodDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const uniqueYears = Array.from(
    new Set([
      ...academicPeriods.map((p) => p.tahunAjaran),
      ...ACADEMIC_YEAR_OPTIONS,
      school.tahunAjaran,
    ])
  ).sort();

  const handleYearChange = (newYear: string) => {
    if (onUpdateSchool) {
      onUpdateSchool({ ...school, tahunAjaran: newYear, periodeStatus: 'Aktif' });
    }
  };

  const handleSemesterChange = (newSemester: 'Ganjil' | 'Genap') => {
    if (onUpdateSchool) {
      onUpdateSchool({ ...school, semester: newSemester, periodeStatus: 'Aktif' });
    }
  };

  const handleTogglePeriodStatus = (periodId: string, nextStatus: 'Aktif' | 'Off') => {
    if (!onUpdateAcademicPeriods) return;
    const updated = academicPeriods.map((p) => {
      if (nextStatus === 'Aktif') {
        return { ...p, status: (p.id === periodId ? 'Aktif' : 'Off') as 'Aktif' | 'Off' };
      }
      return p.id === periodId ? { ...p, status: 'Off' as const } : p;
    });
    onUpdateAcademicPeriods(updated);
  };

  const formatTabTitle = (tab: NavTab) => {
    const titles: Record<NavTab, string> = {
      dashboard: 'Dashboard Supervisi',
      profil_sekolah: 'Profil Lembaga Pendidikan',
      profil_guru: 'Profil Guru',
      data_guru: 'Data Guru & Tenaga Pendidik',
      agenda_supervisi: 'Agenda & Tahapan Supervisi',
      timeline_supervisi: 'Timeline Supervisi Akademik',
      jadwal_visitasi: 'Jadwal Visitasi & Kunjungan Kelas',
      program_supervisi: 'Program Kerja Supervisi Akademik',
      administrasi_guru: 'Pemeriksaan Administrasi Guru',
      telaah_adm: 'Instrumen Telaah Adm. Pembelajaran',
      telaah_atp: 'Telaah Alur Tujuan Pembelajaran (ATP)',
      telaah_modul: 'Telaah Modul Ajar / RPP Berdiferensiasi',
      pra_observasi: 'Wawancara & Lembar Pra-Observasi',
      supervisi_pembelajaran: 'Supervisi Pelaksanaan Pembelajaran (KBM)',
      pasca_observasi: 'Pasca-Observasi, Refleksi & Coaching',
      supervisi_asesmen: 'Supervisi Instrumen Asesmen Siswa',
      hasil_supervisi: 'Hasil & Rekapitulasi Nilai Supervisi',
      tindak_lanjut: 'Rencana Tindak Lanjut (RTL) Pembinaan',
      laporan_supervisi: 'Laporan Resmi Hasil Supervisi Akademik',
      sertifikat: 'Sertifikat Hasil Supervisi Guru',
      pengaturan_ai: 'Pengaturan Integrasi AI & API Key',
    };
    return titles[tab] || 'Supervisi Akademik';
  };

  const isPeriodOff = school.periodeStatus === 'Off';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-20 print:hidden">
      {/* Left side: Sidebar toggle, breadcrumb and title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? 'Perluas Menu Aplikasi' : 'Ciutkan Menu Aplikasi'}
            aria-label={isSidebarCollapsed ? 'Perluas Menu Aplikasi' : 'Ciutkan Menu Aplikasi'}
            className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 text-gray-600 hover:text-emerald-800 transition-colors cursor-pointer shrink-0"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-800 font-semibold">
              <School className="w-3.5 h-3.5 text-emerald-600" />
              {school.namaSekolah}
            </span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600 capitalize">{activeTab.replace(/_/g, ' ')}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">
            {formatTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Right side: Search, Period dropdown, AI Coach button, Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari guru, mapel, jadwal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 text-xs bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-48 lg:w-64 transition-all"
          />
        </div>

        {/* Academic Period Badge / Dropdown (Editable by Admin only) */}
        <div className="relative hidden sm:block" ref={periodDropdownRef}>
          {currentUser.role === 'admin' ? (
            <button
              type="button"
              onClick={() => setIsPeriodOpen((prev) => !prev)}
              title="Pilih Tahun Ajaran dan Semester Aktif"
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isPeriodOff
                  ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-700'
                  : 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200/80 text-emerald-900'
              }`}
            >
              <Calendar
                className={`w-3.5 h-3.5 shrink-0 ${
                  isPeriodOff ? 'text-slate-500' : 'text-emerald-700'
                }`}
              />
              <span className="whitespace-nowrap">
                TA {school.tahunAjaran} ({school.semester})
              </span>
              {isPeriodOff && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-600 text-white">
                  Off
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isPeriodOff ? 'text-slate-500' : 'text-emerald-700'
                } ${isPeriodOpen ? 'rotate-180' : ''}`}
              />
            </button>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium ${
                isPeriodOff
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
              }`}
            >
              <Calendar
                className={`w-3.5 h-3.5 shrink-0 ${
                  isPeriodOff ? 'text-slate-500' : 'text-emerald-700'
                }`}
              />
              <span className="whitespace-nowrap">
                {isPeriodOff
                  ? 'Belum ada TA Aktif'
                  : `TA ${school.tahunAjaran} (${school.semester})`}
              </span>
            </div>
          )}

          {currentUser.role === 'admin' && isPeriodOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-gray-900">
                  Periode Akademik Aktif
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isPeriodOff
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isPeriodOff ? 'Off' : 'Aktif'}
                </span>
              </div>

              {academicPeriods.length > 0 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  <span className="block text-[11px] font-semibold text-gray-600">
                    Daftar Periode Terdaftar
                  </span>
                  {academicPeriods.map((p) => {
                    const active = p.status === 'Aktif';
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
                          active
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="font-semibold truncate">
                          {p.tahunAjaran} ({p.semester})
                        </span>
                        <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePeriodStatus(p.id, 'Aktif')}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              active
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-500 hover:text-emerald-700'
                            }`}
                          >
                            Aktif
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTogglePeriodStatus(p.id, 'Off')}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              !active
                                ? 'bg-slate-600 text-white'
                                : 'text-gray-500 hover:text-slate-800'
                            }`}
                          >
                            Off
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Tahun Ajaran
                  </label>
                  <select
                    value={school.tahunAjaran}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className="w-full text-xs font-semibold px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">
                    Semester
                  </label>
                  <select
                    value={school.semester}
                    onChange={(e) =>
                      handleSemesterChange(e.target.value as 'Ganjil' | 'Genap')
                    }
                    className="w-full text-xs font-semibold px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  Berlaku untuk seluruh menu
                </span>
                <button
                  type="button"
                  onClick={() => setIsPeriodOpen(false)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#064e3b] hover:bg-[#033c2a] text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  <Check className="w-3 h-3" />
                  <span>Selesai</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          title="Buka AI Asisten Supervisi Guru"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer group"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">AI Asisten Supervisi</span>
        </button>
      </div>
    </header>
  );
};
