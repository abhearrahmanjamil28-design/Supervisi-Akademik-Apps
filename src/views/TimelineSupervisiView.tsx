import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  UserCheck,
  X,
  ListChecks,
  CircleDot
} from 'lucide-react';
import { SchoolProfile, TimelineEntry, User } from '../types/supervisi';
import { NavTab } from '../components/Sidebar';

interface TimelineSupervisiViewProps {
  school: SchoolProfile;
  entries: TimelineEntry[];
  onAddEntry: (entry: TimelineEntry) => void;
  onUpdateEntry: (entry: TimelineEntry) => void;
  onDeleteEntry: (id: string) => void;
  setActiveTab: (tab: NavTab) => void;
  currentUser: User;
}

const ADMIN_LINK_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Tidak ada tautan menu' },
  { value: 'program_supervisi', label: 'Program Supervisi' },
  { value: 'jadwal_visitasi', label: 'Jadwal Visitasi' },
  { value: 'administrasi_guru', label: 'Administrasi Guru' },
  { value: 'data_guru', label: 'Data Guru' },
  { value: 'hasil_supervisi', label: 'Hasil Supervisi' },
  { value: 'tindak_lanjut', label: 'Tindak Lanjut' },
  { value: 'laporan_supervisi', label: 'Laporan Hasil Supervisi' },
];

export const TimelineSupervisiView: React.FC<TimelineSupervisiViewProps> = ({
  school,
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  setActiveTab,
  currentUser,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | TimelineEntry['status']>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null);

  // Form states
  const [tahap, setTahap] = useState('');
  const [periode, setPeriode] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('2026-11-01');
  const [tanggalSelesai, setTanggalSelesai] = useState('2026-11-15');
  const [penanggungJawab, setPenanggungJawab] = useState('Admin & Kepala Sekolah');
  const [status, setStatus] = useState<TimelineEntry['status']>('Mendatang');
  const [deskripsi, setDeskripsi] = useState('');
  const [kegiatan, setKegiatan] = useState<string[]>(['']);
  const [targetTab, setTargetTab] = useState<string>('');

  const canManage = currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah';
  const isGuru = currentUser.role === 'guru';
  const guruAllowedTabs: NavTab[] = [
    'dashboard',
    'profil_sekolah',
    'timeline_supervisi',
    'jadwal_visitasi',
    'administrasi_guru',
    'pra_observasi',
    'pasca_observasi',
    'hasil_supervisi',
    'tindak_lanjut',
    'sertifikat',
  ];

  useEffect(() => {
    if (!canManage && isModalOpen) {
      setIsModalOpen(false);
      setEditingEntry(null);
    }
  }, [canManage, isModalOpen]);

  const filteredEntries = entries.filter((entry) => {
    if (filterStatus === 'ALL') return true;
    return entry.status === filterStatus;
  });

  const completedCount = entries.filter((e) => e.status === 'Selesai').length;
  const activeCount = entries.filter((e) => e.status === 'Sedang Berjalan').length;
  const upcomingCount = entries.filter((e) => e.status === 'Mendatang').length;
  const progressPct = entries.length ? Math.round((completedCount / entries.length) * 100) : 0;

  const openAddModal = () => {
    if (!canManage) return;
    setEditingEntry(null);
    setTahap('');
    setPeriode('November 2026');
    setTanggalMulai('2026-11-01');
    setTanggalSelesai('2026-11-15');
    setPenanggungJawab('Admin & Kepala Sekolah');
    setStatus('Mendatang');
    setDeskripsi('');
    setKegiatan(['']);
    setTargetTab('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: TimelineEntry) => {
    if (!canManage) return;
    setEditingEntry(entry);
    setTahap(entry.tahap);
    setPeriode(entry.periode);
    setTanggalMulai(entry.tanggalMulai);
    setTanggalSelesai(entry.tanggalSelesai);
    setPenanggungJawab(entry.penanggungJawab);
    setStatus(entry.status);
    setDeskripsi(entry.deskripsi);
    setKegiatan(entry.kegiatan.length > 0 ? [...entry.kegiatan] : ['']);
    setTargetTab(entry.targetTab || '');
    setIsModalOpen(true);
  };

  const handleKegiatanChange = (idx: number, val: string) => {
    const next = [...kegiatan];
    next[idx] = val;
    setKegiatan(next);
  };

  const handleAddKegiatanField = () => {
    setKegiatan([...kegiatan, '']);
  };

  const handleRemoveKegiatanField = (idx: number) => {
    if (kegiatan.length <= 1) {
      setKegiatan(['']);
      return;
    }
    setKegiatan(kegiatan.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !tahap.trim() || !periode.trim()) return;

    const cleanedKegiatan = kegiatan.map((k) => k.trim()).filter(Boolean);

    if (editingEntry) {
      onUpdateEntry({
        ...editingEntry,
        tahap: tahap.trim(),
        periode: periode.trim(),
        tanggalMulai,
        tanggalSelesai,
        penanggungJawab: penanggungJawab.trim() || 'Admin Kurikulum',
        status,
        deskripsi: deskripsi.trim(),
        kegiatan: cleanedKegiatan,
        targetTab: targetTab || undefined,
      });
    } else {
      const newEntry: TimelineEntry = {
        id: `tl-sup-${Date.now()}`,
        tahap: tahap.trim(),
        periode: periode.trim(),
        tanggalMulai,
        tanggalSelesai,
        penanggungJawab: penanggungJawab.trim() || 'Admin Kurikulum',
        status,
        deskripsi: deskripsi.trim(),
        kegiatan: cleanedKegiatan,
        targetTab: targetTab || undefined,
      };
      onAddEntry(newEntry);
    }

    setIsModalOpen(false);
  };

  const formatShortDate = (iso: string) => {
    if (!iso) return '-';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${parts[2]} ${months[mIdx] || parts[1]} ${parts[0]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Timeline Supervisi Akademik</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Linimasa tahapan & agenda supervisi Tahun Ajaran {school.tahunAjaran} • Semester {school.semester} • {school.namaSekolah}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Timeline Supervisi</span>
          </button>
        )}
      </div>

      {/* Progress & Filter Overview */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'Sedang Berjalan', 'Selesai', 'Mendatang'] as const).map((st) => {
              const count =
                st === 'ALL'
                  ? entries.length
                  : st === 'Selesai'
                  ? completedCount
                  : st === 'Sedang Berjalan'
                  ? activeCount
                  : upcomingCount;

              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterStatus === st
                      ? 'bg-[#033c2a] text-white shadow-xs'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{st === 'ALL' ? 'Semua Tahap' : st}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      filterStatus === st ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 min-w-[220px]">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 mb-1">
                <span>Progres Pelaksanaan</span>
                <span className="text-emerald-800 font-bold">{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Visual Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center space-y-2">
          <Clock className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-bold text-gray-700">Belum ada agenda pada kategori ini</p>
          <p className="text-xs text-gray-500">
            {canManage
              ? 'Klik tombol "Tambah Timeline Supervisi" untuk menambahkan jadwal tahapan baru.'
              : 'Belum ada agenda timeline supervisi pada kategori ini.'}
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-10 space-y-6 before:content-[''] before:absolute before:left-[15px] sm:before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-300 before:to-gray-200">
          {filteredEntries.map((item, idx) => {
            const isDone = item.status === 'Selesai';
            const isCurrent = item.status === 'Sedang Berjalan';

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Node Marker */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-5 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 border-slate-50 shadow-sm z-10 transition-transform group-hover:scale-105 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#033c2a] text-emerald-300 ring-4 ring-emerald-500/20'
                      : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : isCurrent ? (
                    <CircleDot className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Timeline Card */}
                <div
                  className={`ml-4 sm:ml-6 rounded-2xl border p-5 transition-all ${
                    isCurrent
                      ? 'bg-white border-emerald-400 ring-2 ring-emerald-500/15 shadow-md'
                      : isDone
                      ? 'bg-white border-gray-200 shadow-xs hover:shadow-sm'
                      : 'bg-white/90 border-gray-200 border-dashed shadow-xs hover:border-solid'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          {item.periode}
                        </span>

                        {(item.tanggalMulai || item.tanggalSelesai) && (
                          <span className="text-[11px] text-gray-500 font-medium">
                            ({formatShortDate(item.tanggalMulai)} – {formatShortDate(item.tanggalSelesai)})
                          </span>
                        )}

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCurrent
                              ? 'bg-emerald-700 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {item.tahap}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Penanggung Jawab:{' '}
                          <strong className="text-gray-800">{item.penanggungJawab}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Card Controls */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {canManage && (
                        <>
                          <select
                            aria-label="Ubah status timeline"
                            value={item.status}
                            onChange={(e) =>
                              onUpdateEntry({
                                ...item,
                                status: e.target.value as TimelineEntry['status'],
                              })
                            }
                            className="text-[11px] font-semibold px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="Selesai">Selesai</option>
                            <option value="Sedang Berjalan">Sedang Berjalan</option>
                            <option value="Mendatang">Mendatang</option>
                          </select>

                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit Timeline"
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Hapus agenda "${item.tahap}" dari timeline?`)) {
                                onDeleteEntry(item.id);
                              }
                            }}
                            title="Hapus Timeline"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {item.targetTab &&
                        (!isGuru || guruAllowedTabs.includes(item.targetTab as NavTab)) && (
                          <button
                            onClick={() => setActiveTab(item.targetTab as NavTab)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            title="Buka Menu Terkait"
                          >
                            <span>Buka Menu</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Description & Checklist */}
                  <div className="mt-3.5 space-y-3">
                    {item.deskripsi && (
                      <p className="text-xs text-gray-600 leading-relaxed">{item.deskripsi}</p>
                    )}

                    {item.kegiatan.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <ListChecks className="w-3.5 h-3.5 text-emerald-600" />
                          Rincian Agenda Kegiatan:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {item.kegiatan.map((k, kIdx) => (
                            <li
                              key={kIdx}
                              className="p-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-xs text-gray-700 flex items-start gap-2"
                            >
                              <CheckCircle2
                                className={`w-4 h-4 shrink-0 mt-0.5 ${
                                  isDone
                                    ? 'text-emerald-600'
                                    : isCurrent
                                    ? 'text-emerald-700'
                                    : 'text-gray-400'
                                }`}
                              />
                              <span className="leading-relaxed">{k}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Timeline Modal */}
      {canManage && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#033c2a] to-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingEntry ? 'Edit Agenda Timeline Supervisi' : 'Tambah Timeline Supervisi'}
                </h3>
                <p className="text-[11px] text-emerald-200">
                  Isi jadwal tahapan dan rincian agenda supervisi akademik
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Judul Tahap / Agenda Supervisi *
                </label>
                <input
                  type="text"
                  required
                  value={tahap}
                  onChange={(e) => setTahap(e.target.value)}
                  placeholder="Contoh: Tahap 6: Rapat Evaluasi & Refleksi Akhir Tahun"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Label Periode *
                  </label>
                  <input
                    type="text"
                    required
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    placeholder="Contoh: November 2026"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Tahap</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TimelineEntry['status'])}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Mendatang">Mendatang</option>
                    <option value="Sedang Berjalan">Sedang Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    placeholder="Contoh: Kepala Sekolah & Tim Kurikulum"
                    className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tautan Menu Terkait
                  </label>
                  <select
                    value={targetTab}
                    onChange={(e) => setTargetTab(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {ADMIN_LINK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Jelaskan fokus utama atau sasaran pada tahap supervisi ini..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-gray-700">Daftar Kegiatan Utama</label>
                  <button
                    type="button"
                    onClick={handleAddKegiatanField}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Kegiatan</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {kegiatan.map((k, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={k}
                        onChange={(e) => handleKegiatanChange(idx, e.target.value)}
                        placeholder={`Rincian kegiatan ke-${idx + 1}...`}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveKegiatanField(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Hapus kegiatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingEntry ? 'Simpan Perubahan' : 'Simpan Timeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
