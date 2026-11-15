import React from 'react';
import {
  LayoutGrid,
  User as UserIcon,
  Users,
  FileText,
  Calendar,
  ClipboardList,
  FolderArchive,
  FileSearch,
  CheckCircle2,
  Award,
  TrendingUp,
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  GraduationCap,
  Clock,
  UserCheck,
  KeyRound,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { User } from '../types/supervisi';

export type NavTab =
  | 'dashboard'
  | 'profil_sekolah'
  | 'profil_guru'
  | 'data_guru'
  | 'agenda_supervisi'
  | 'timeline_supervisi'
  | 'jadwal_visitasi'
  | 'program_supervisi'
  | 'administrasi_guru'
  | 'telaah_adm'
  | 'telaah_atp'
  | 'telaah_modul'
  | 'pra_observasi'
  | 'supervisi_pembelajaran'
  | 'pasca_observasi'
  | 'supervisi_asesmen'
  | 'hasil_supervisi'
  | 'tindak_lanjut'
  | 'laporan_supervisi'
  | 'sertifikat'
  | 'pengaturan_ai';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: User;
  onLogout: () => void;
  onOpenSwitchRole: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenSwitchRole,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Menu items specifically for Admin (matches 0.1.1_3225437e.png exactly: 10 items)
  const adminMenuItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'profil_sekolah' as NavTab, label: 'Profil Sekolah', icon: UserIcon },
    { id: 'data_guru' as NavTab, label: 'Data Guru', icon: Users },
    { id: 'timeline_supervisi' as NavTab, label: 'Timeline Supervisi', icon: Clock },
    { id: 'jadwal_visitasi' as NavTab, label: 'Jadwal Visitasi', icon: Calendar },
    { id: 'program_supervisi' as NavTab, label: 'Program Supervisi', icon: ClipboardList },
    { id: 'administrasi_guru' as NavTab, label: 'Administrasi Guru', icon: FolderArchive },
    { id: 'hasil_supervisi' as NavTab, label: 'Hasil Supervisi', icon: CheckCircle2 },
    { id: 'tindak_lanjut' as NavTab, label: 'Tindak Lanjut', icon: TrendingUp },
    { id: 'laporan_supervisi' as NavTab, label: 'Laporan Hasil Supervisi', icon: FileSpreadsheet },
    { id: 'sertifikat' as NavTab, label: 'Sertifikat', icon: Award },
    { id: 'pengaturan_ai' as NavTab, label: 'Pengaturan AI & API Key', icon: KeyRound },
  ];

  // Full 17 items for Kepala Sekolah (matches 0.2.png)
  const kepalaSekolahMenuItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'profil_sekolah' as NavTab, label: 'Profil Sekolah', icon: UserIcon },
    { id: 'data_guru' as NavTab, label: 'Data Guru', icon: Users },
    { id: 'agenda_supervisi' as NavTab, label: 'Agenda Supervisi', icon: FileText },
    { id: 'jadwal_visitasi' as NavTab, label: 'Jadwal Visitasi', icon: Calendar },
    { id: 'program_supervisi' as NavTab, label: 'Program Supervisi', icon: ClipboardList },
    { id: 'telaah_adm' as NavTab, label: 'Telaah Adm. Pembelajaran', icon: FileSearch },
    { id: 'telaah_atp' as NavTab, label: 'Telaah ATP', icon: FileSearch },
    { id: 'telaah_modul' as NavTab, label: 'Telaah Modul Ajar', icon: FileSearch },
    { id: 'pra_observasi' as NavTab, label: 'Pra-Observasi', icon: FileSearch },
    { id: 'supervisi_pembelajaran' as NavTab, label: 'Supervisi Pembelajaran', icon: FileSearch },
    { id: 'pasca_observasi' as NavTab, label: 'Pasca-Observasi & Refleksi', icon: FileSearch },
    { id: 'supervisi_asesmen' as NavTab, label: 'Supervisi Asesmen', icon: FileSearch },
    { id: 'hasil_supervisi' as NavTab, label: 'Hasil Supervisi', icon: CheckCircle2 },
    { id: 'tindak_lanjut' as NavTab, label: 'Tindak Lanjut', icon: TrendingUp },
    { id: 'laporan_supervisi' as NavTab, label: 'Laporan Hasil Supervisi', icon: FileSpreadsheet },
  ];

  // Menu items for Guru
  const guruMenuItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutGrid },
    { id: 'profil_sekolah' as NavTab, label: 'Profil Sekolah', icon: UserIcon },
    { id: 'profil_guru' as NavTab, label: 'Profil Guru', icon: UserCheck },
    { id: 'timeline_supervisi' as NavTab, label: 'Timeline Supervisi', icon: Clock },
    { id: 'jadwal_visitasi' as NavTab, label: 'Jadwal Visitasi', icon: Calendar },
    { id: 'administrasi_guru' as NavTab, label: 'Administrasi Guru', icon: FolderArchive },
    { id: 'pra_observasi' as NavTab, label: 'Pra-Observasi', icon: FileSearch },
    { id: 'pasca_observasi' as NavTab, label: 'Pasca-Observasi & Refleksi', icon: FileSearch },
    { id: 'hasil_supervisi' as NavTab, label: 'Hasil Supervisi', icon: CheckCircle2 },
    { id: 'tindak_lanjut' as NavTab, label: 'Tindak Lanjut', icon: TrendingUp },
    { id: 'sertifikat' as NavTab, label: 'Sertifikat', icon: Award },
  ];

  const currentMenuItems =
    currentUser.role === 'admin'
      ? adminMenuItems
      : currentUser.role === 'kepala_sekolah'
      ? kepalaSekolahMenuItems
      : guruMenuItems;

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20 min-w-20' : 'w-80 min-w-80'
      } bg-[#033c2a] text-white flex flex-col h-screen select-none border-r border-[#022e20] shadow-2xl relative z-20 overflow-hidden transition-all duration-200 print:hidden`}
    >
      {/* Top Header Logo Section */}
      <div
        className={`${
          isCollapsed
            ? 'pt-5 pb-3 px-2 flex-col items-center gap-2.5'
            : 'pt-6 pb-4 px-6 flex items-center justify-between gap-2'
        } flex`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Shield with user icon inside */}
          <div className="shrink-0 flex items-center justify-center">
            <svg
              className={`${isCollapsed ? 'w-10 h-11' : 'w-12 h-14'} transition-all duration-200`}
              viewBox="0 0 48 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 2L6 8V24C6 36.5 13.7 48.1 24 53C34.3 48.1 42 36.5 42 24V8L24 2Z"
                stroke="white"
                strokeWidth="3.2"
                fill="none"
                strokeLinejoin="round"
              />
              <circle
                cx="24"
                cy="20"
                r="5.5"
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M14 36.5C14 31.5 18.2 28.5 24 28.5C29.8 28.5 34 31.5 34 36.5"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="text-[#19a544] font-black tracking-tight text-xl font-sans drop-shadow-xs">
                  Super
                </span>
                <span className="text-white font-medium text-lg tracking-normal">
                  Guru Apps
                </span>
              </div>
              <span className="text-white font-extrabold text-[15px] tracking-tight uppercase mt-1 leading-tight truncate">
                SMA Plus UQ Al-Mustofa
              </span>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Perluas Menu Aplikasi' : 'Ciutkan Menu Aplikasi'}
            aria-label={isCollapsed ? 'Perluas Menu Aplikasi' : 'Ciutkan Menu Aplikasi'}
            className="p-1.5 rounded-lg bg-[#022c1e] hover:bg-[#064e3b] text-emerald-200 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Menu List */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-800 scrollbar-track-transparent">
        {currentMenuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-full flex items-center ${
                isCollapsed
                  ? 'justify-center px-0 py-3'
                  : 'gap-3.5 px-6 py-2.5 text-left'
              } cursor-pointer transition-colors duration-150 group ${
                isActive
                  ? 'bg-[#008726] text-white font-bold shadow-xs'
                  : 'text-white hover:bg-[#064e3b] font-medium'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0 stroke-[2] text-white" />
              {!isCollapsed && (
                <span className="tracking-normal text-[14.5px] leading-tight truncate">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile Section */}
      <div className="mt-auto pb-4 pt-2">
        {/* Thin divider line */}
        <div
          className={`${
            isCollapsed ? 'mx-3' : 'mx-6'
          } border-t border-white/20 mb-3.5`}
        />

        {/* User Card */}
        <div
          onClick={onOpenSwitchRole}
          title={
            isCollapsed
              ? `${
                  currentUser.role === 'admin'
                    ? 'Admin'
                    : currentUser.role === 'kepala_sekolah'
                    ? 'Supervisor'
                    : currentUser.name
                } — Klik untuk beralih profil / peran login`
              : 'Klik untuk beralih profil / peran login'
          }
          className={`flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'gap-3.5 px-6'
          } py-1.5 cursor-pointer hover:opacity-90 transition-opacity`}
        >
          {/* Avatar Circle */}
          <div
            className={`${
              isCollapsed ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl'
            } rounded-full bg-[#059669] flex items-center justify-center text-white font-bold shrink-0 shadow-sm transition-all`}
          >
            {currentUser.role === 'admin'
              ? 'A'
              : currentUser.role === 'kepala_sekolah'
              ? 'S'
              : currentUser.name.charAt(0) || 'G'}
          </div>

          {/* User Name & Details */}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              {currentUser.role === 'admin' ? (
                <span className="text-white text-lg font-bold tracking-tight">
                  Admin
                </span>
              ) : currentUser.role === 'kepala_sekolah' ? (
                <>
                  <span className="text-white text-sm font-bold truncate leading-tight">
                    Supervisor
                  </span>
                  <span className="text-emerald-300 text-xs truncate mt-0.5">
                    Supervisi Akademik
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white text-sm font-bold truncate leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-emerald-300 text-xs truncate mt-0.5">
                    Guru {currentUser.subject || 'Mata Pelajaran'}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className={`${isCollapsed ? 'px-3' : 'px-6'} mt-3`}>
          <button
            onClick={onLogout}
            title="Keluar Sistem"
            className={`w-full flex items-center justify-center ${
              isCollapsed ? 'px-0' : 'gap-2.5 px-4'
            } py-2.5 rounded-xl bg-[#022c1e] hover:bg-[#043d2b] active:scale-[0.99] text-white/95 hover:text-white text-sm font-semibold transition-all border border-[#064e3b] shadow-sm cursor-pointer`}
          >
            <LogOut className="w-4 h-4 text-emerald-300 rotate-180 shrink-0" />
            {!isCollapsed && <span>Keluar Sistem</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
