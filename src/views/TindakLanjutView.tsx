import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
  AlertCircle,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Teacher, TindakLanjutRecord, SchoolProfile, User } from '../types/supervisi';

interface TindakLanjutViewProps {
  teachers: Teacher[];
  tindakLanjutList: TindakLanjutRecord[];
  onAddTindakLanjut: (item: TindakLanjutRecord) => void;
  onUpdateStatus: (id: string, status: TindakLanjutRecord['status']) => void;
  school: SchoolProfile;
  currentUser: User;
}

export const TindakLanjutView: React.FC<TindakLanjutViewProps> = ({
  teachers,
  tindakLanjutList,
  onAddTindakLanjut,
  onUpdateStatus,
  school,
  currentUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // New form
  const [selectedGuruId, setSelectedGuruId] = useState(teachers[0]?.id || '');
  const [bentuk, setBentuk] = useState<TindakLanjutRecord['bentukTindakLanjut']>(
    'Peer Tutoring (Tutor Sebaya)'
  );
  const [uraianKegiatan, setUraianKegiatan] = useState(
    'Pendampingan penyusunan asesmen berbasis penalaran tinggi dan diferensiasi konten.'
  );
  const [tenggatWaktu, setTenggatWaktu] = useState('2026-11-20');
  const [penanggungJawab, setPenanggungJawab] = useState('Wakasek Kurikulum & Kepala Sekolah');

  const canManage = currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah';

  const filtered = tindakLanjutList.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: TindakLanjutRecord = {
      id: `tl-${Date.now()}`,
      guruId: selectedGuruId,
      hasilSupervisiSkor: 90,
      bentukTindakLanjut: bentuk,
      uraianKegiatan,
      tenggatWaktu,
      penanggungJawab,
      status: 'Rencana',
    };
    onAddTindakLanjut(newRecord);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Rencana Tindak Lanjut (RTL) Supervisi</h2>
          <p className="text-xs text-gray-500">
            Matriks pembinaan berkelanjutan, tutor sebaya, workshop MGMP, dan pengembangan keprofesian berkelanjutan
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Program Tindak Lanjut</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['ALL', 'Rencana', 'Sedang Berjalan', 'Selesai'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === status
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'Semua RTL' : status}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const teacher = teachers.find((t) => t.id === item.guruId);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-100">
                    {item.bentukTindakLanjut}
                  </span>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      item.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Sedang Berjalan'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-gray-900 leading-tight">
                  {teacher ? `${teacher.nama}, ${teacher.gelar}` : 'Dewan Guru'}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                  {teacher?.mapel || 'Mata Pelajaran'}
                </p>

                <p className="text-xs text-gray-600 mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                  {item.uraianKegiatan}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tenggat: <strong className="text-gray-800">{item.tenggatWaktu}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate">PJ: {item.penanggungJawab}</span>
                  </div>
                </div>
              </div>

              {/* Status Updater */}
              {canManage && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400">Ubah Status:</span>
                  <div className="flex items-center gap-1">
                    {(['Rencana', 'Sedang Berjalan', 'Selesai'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateStatus(item.id, st)}
                        className={`text-[10px] px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                          item.status === st
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add RTL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
              Rencana Program Tindak Lanjut Guru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Guru Sasaran</label>
                <select
                  value={selectedGuruId}
                  onChange={(e) => setSelectedGuruId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama}, {t.gelar} ({t.mapel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Bentuk Pembinaan Tindak Lanjut
                </label>
                <select
                  value={bentuk}
                  onChange={(e) =>
                    setBentuk(e.target.value as TindakLanjutRecord['bentukTindakLanjut'])
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="Peer Tutoring (Tutor Sebaya)">Peer Tutoring (Tutor Sebaya)</option>
                  <option value="Workshop MGMP">Workshop MGMP Internal / Kota</option>
                  <option value="Bimbingan Teknis Individu">Bimbingan Teknis Individu (Kepsek/Pengawas)</option>
                  <option value="Pelatihan Mandiri PMM">Pelatihan Mandiri Platform Merdeka Mengajar (PMM)</option>
                  <option value="Supervisi Ulang">Supervisi Ulang Siklus II</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Uraian Rencana Kegiatan
                </label>
                <textarea
                  rows={3}
                  required
                  value={uraianKegiatan}
                  onChange={(e) => setUraianKegiatan(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Deskripsikan agenda pembinaan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    required
                    value={tenggatWaktu}
                    onChange={(e) => setTenggatWaktu(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    required
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl cursor-pointer"
                >
                  Simpan RTL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
