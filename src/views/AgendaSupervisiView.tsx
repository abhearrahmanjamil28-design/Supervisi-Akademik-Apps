import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Users,
  Target
} from 'lucide-react';
import { SchoolProfile } from '../types/supervisi';
import { NavTab } from '../components/Sidebar';

interface AgendaSupervisiViewProps {
  school: SchoolProfile;
  setActiveTab: (tab: NavTab) => void;
}

export const AgendaSupervisiView: React.FC<AgendaSupervisiViewProps> = ({
  school,
  setActiveTab,
}) => {
  const agendaList = [
    {
      bulan: 'Juli - Agustus',
      tahap: 'Tahap 1: Persiapan & Sosialisasi',
      status: 'Selesai',
      kegiatan: [
        'Pembentukan Tim Supervisi Internal SMA Plus UQ Al-Mustofa',
        'Sosialisasi Instrumen Supervisi Kurikulum Merdeka kepada seluruh dewan guru',
        'Penetapan jadwal visitasi kelas semester ganjil'
      ],
      targetTab: 'program_supervisi' as NavTab
    },
    {
      bulan: 'September',
      tahap: 'Tahap 2: Telaah Administrasi & Dokumen Kurikulum',
      status: 'Selesai',
      kegiatan: [
        'Pemeriksaan berkas Prota, Promes, dan Kalender Pendidikan',
        'Telaah Alur Tujuan Pembelajaran (ATP) Fase E dan F',
        'Telaah Modul Ajar dan integrasi pembelajaran berdiferensiasi'
      ],
      targetTab: 'telaah_adm' as NavTab
    },
    {
      bulan: 'Oktober - November',
      tahap: 'Tahap 3: Pelaksanaan Pra-Observasi & KBM Kelas',
      status: 'Sedang Berjalan',
      kegiatan: [
        'Wawancara pra-observasi dan penetapan fokus pengamatan',
        'Observasi langsung proses belajar mengajar di ruang kelas',
        'Pemberian catatan observer berbasis indikator rubrik'
      ],
      targetTab: 'supervisi_pembelajaran' as NavTab
    },
    {
      bulan: 'November',
      tahap: 'Tahap 4: Pasca-Observasi & Dialog Refleksi',
      status: 'Mendatang',
      kegiatan: [
        'Wawancara umpan balik dan dialog coaching reflektif',
        'Penetapan kesepakatan area yang perlu ditingkatkan',
        'Telaah instrumen asesmen hasil belajar murid'
      ],
      targetTab: 'pasca_observasi' as NavTab
    },
    {
      bulan: 'Desember',
      tahap: 'Tahap 5: Pelaporan & Evaluasi Tindak Lanjut',
      status: 'Mendatang',
      kegiatan: [
        'Penyusunan rekapitulasi nilai akhir dan predikat supervisi',
        'Pelaksanaan program tindak lanjut (Bimtek / Tutor Sebaya)',
        'Pencetakan laporan resmi dan penyerahan ke Pengawas Pembina'
      ],
      targetTab: 'laporan_supervisi' as NavTab
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agenda & Timeline Supervisi Akademik</h2>
          <p className="text-xs text-gray-500">
            Tahun Ajaran {school.tahunAjaran} • Semester {school.semester} • {school.namaSekolah}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            Fase Aktif: Tahap 3 (Observasi KBM)
          </span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {agendaList.map((item, index) => {
          const isDone = item.status === 'Selesai';
          const isCurrent = item.status === 'Sedang Berjalan';

          return (
            <div
              key={index}
              className={`p-5 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-emerald-50/40 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : isDone
                  ? 'bg-white border-gray-200'
                  : 'bg-white/70 border-dashed border-gray-200 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-800 text-white animate-pulse'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{item.tahap}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.bulan}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.status}
                  </span>

                  <button
                    onClick={() => setActiveTab(item.targetTab)}
                    className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    title="Buka Menu Terkait"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Daftar Kegiatan Utama:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {item.kegiatan.map((k, kIdx) => (
                    <li
                      key={kIdx}
                      className="p-2.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-700 flex items-start gap-2 shadow-2xs"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isDone ? 'text-emerald-600' : isCurrent ? 'text-emerald-700' : 'text-gray-300'
                        }`}
                      />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
