import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter,
  UserCheck,
  Building,
  Edit2,
  Trash2
} from 'lucide-react';
import { VisitationSchedule, Teacher, User, SchoolProfile } from '../types/supervisi';
import { NavTab } from '../components/Sidebar';

interface JadwalVisitasiViewProps {
  schedules: VisitationSchedule[];
  teachers: Teacher[];
  school?: SchoolProfile;
  currentUser: User;
  onAddSchedule: (schedule: VisitationSchedule) => void;
  onUpdateSchedule?: (schedule: VisitationSchedule) => void;
  onUpdateScheduleStatus: (id: string, status: VisitationSchedule['status']) => void;
  onDeleteSchedule: (id: string) => void;
  setActiveTab: (tab: NavTab) => void;
}

export const JadwalVisitasiView: React.FC<JadwalVisitasiViewProps> = ({
  schedules,
  teachers,
  school,
  currentUser,
  onAddSchedule,
  onUpdateSchedule,
  onUpdateScheduleStatus,
  onDeleteSchedule,
  setActiveTab,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<VisitationSchedule | null>(null);

  const defaultSupervisorName =
    school?.kepalaSekolah ||
    (teachers[0] ? `${teachers[0].nama}, ${teachers[0].gelar}` : 'Drs. H. Ahmad Mustofa, M.Pd.');

  // Schedule form states
  const [selectedGuruId, setSelectedGuruId] = useState(teachers[0]?.id || '');
  const [tanggal, setTanggal] = useState('2026-10-30');
  const [jamKe, setJamKe] = useState('Jam ke 3-4 (08.45 - 10.15)');
  const [kelas, setKelas] = useState('X-1');
  const [supervisor, setSupervisor] = useState(defaultSupervisorName);
  const [statusInput, setStatusInput] = useState<VisitationSchedule['status']>('Terjadwal');
  const [fokusObservasi, setFokusObservasi] = useState('Penerapan model pembelajaran berdiferensiasi dan keaktifan murid');
  const [catatan, setCatatan] = useState('');

  const canManage = currentUser.role === 'admin';
  const isGuru = currentUser.role === 'guru';

  useEffect(() => {
    if (!canManage && isModalOpen) {
      setIsModalOpen(false);
      setEditingSchedule(null);
    }
  }, [canManage, isModalOpen]);

  // Supervisor choices sourced from Data Guru + Kepala Sekolah
  const teacherSupervisorOptions = teachers.map((t) => ({
    value: `${t.nama}, ${t.gelar}`,
    label: `${t.nama}, ${t.gelar} (${t.mapel})`,
  }));
  const kepsekName = school?.kepalaSekolah || 'Drs. H. Ahmad Mustofa, M.Pd.';
  const supervisorOptions = teacherSupervisorOptions.some(
    (opt) => opt.value.toLowerCase() === kepsekName.toLowerCase()
  )
    ? teacherSupervisorOptions
    : [
        { value: kepsekName, label: `${kepsekName} (Kepala Sekolah)` },
        ...teacherSupervisorOptions,
      ];

  const matchedTeacher = isGuru
    ? teachers.find(
        (t) =>
          t.id === currentUser.id ||
          (currentUser.nip && t.nip === currentUser.nip) ||
          (currentUser.email && t.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : undefined;

  const activeGuruId = matchedTeacher?.id || currentUser.id;

  const roleScopedSchedules = isGuru
    ? schedules.filter(
        (s) =>
          s.guruId === activeGuruId ||
          s.guruId === currentUser.id ||
          (currentUser.name && s.guruNama.toLowerCase() === currentUser.name.toLowerCase())
      )
    : schedules;

  const filtered = roleScopedSchedules.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  const openAddModal = () => {
    if (!canManage) return;
    setEditingSchedule(null);
    setSelectedGuruId(teachers[0]?.id || '');
    setTanggal('2026-10-30');
    setJamKe('Jam ke 3-4 (08.45 - 10.15)');
    setKelas('X-1');
    setSupervisor(defaultSupervisorName);
    setStatusInput('Terjadwal');
    setFokusObservasi('Penerapan model pembelajaran berdiferensiasi dan keaktifan murid');
    setCatatan('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: VisitationSchedule) => {
    if (!canManage) return;
    setEditingSchedule(item);
    setSelectedGuruId(item.guruId || teachers[0]?.id || '');
    setTanggal(item.tanggal);
    setJamKe(item.jamKe);
    setKelas(item.kelas);
    setSupervisor(item.supervisor);
    setStatusInput(item.status);
    setFokusObservasi(item.fokusObservasi);
    setCatatan(item.catatan || '');
    setIsModalOpen(true);
  };

  const handleSupervisorQuickChange = (item: VisitationSchedule, newSupervisor: string) => {
    if (!canManage || !onUpdateSchedule) return;
    onUpdateSchedule({
      ...item,
      supervisor: newSupervisor,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;
    const teacher = teachers.find((t) => t.id === selectedGuruId);
    if (!teacher) return;

    if (editingSchedule && onUpdateSchedule) {
      onUpdateSchedule({
        ...editingSchedule,
        guruId: teacher.id,
        guruNama: `${teacher.nama}, ${teacher.gelar}`,
        mapel: teacher.mapel,
        kelas,
        tanggal,
        jamKe,
        supervisor,
        fokusObservasi,
        status: statusInput,
        catatan: catatan.trim() || undefined,
      });
    } else {
      const newSched: VisitationSchedule = {
        id: `vis-${Date.now()}`,
        guruId: teacher.id,
        guruNama: `${teacher.nama}, ${teacher.gelar}`,
        mapel: teacher.mapel,
        kelas,
        tanggal,
        jamKe,
        supervisor,
        fokusObservasi,
        status: 'Terjadwal',
        catatan: catatan.trim() || undefined,
      };

      onAddSchedule(newSched);
    }

    setEditingSchedule(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Jadwal Visitasi & Kunjungan Kelas</h2>
          <p className="text-xs text-gray-500">
            {isGuru
              ? `Jadwal observasi proses belajar mengajar untuk ${currentUser.name}`
              : 'Penjadwalan observasi langsung proses belajar mengajar di ruang kelas'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Visitasi Baru</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'Terjadwal', 'Sedang Berlangsung', 'Selesai'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === status
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status === 'ALL' ? 'Semua Jadwal' : status}
          </button>
        ))}
      </div>

      {/* Schedules Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Guru & Mapel</th>
                <th className="py-3.5 px-4">Kelas & Waktu</th>
                <th className="py-3.5 px-4">Supervisor</th>
                <th className="py-3.5 px-4">Fokus Observasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 px-4 text-center text-gray-500">
                    <p className="text-sm font-semibold text-gray-700">
                      {isGuru
                        ? 'Belum ada jadwal visitasi untuk akun guru Anda'
                        : 'Belum ada jadwal visitasi pada kategori ini'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isGuru
                        ? 'Jadwal kunjungan supervisi kelas yang ditetapkan oleh Admin akan tampil di sini.'
                        : 'Pilih kategori lain atau tambahkan jadwal visitasi baru.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">
                      <div className="font-bold text-gray-900 text-sm">{item.guruNama}</div>
                      <span className="inline-block mt-0.5 text-xs text-emerald-700 font-semibold">
                        {item.mapel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="font-semibold text-gray-800">{item.kelas}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        {item.tanggal}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{item.jamKe}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {canManage ? (
                        <select
                          aria-label={`Pilih supervisor untuk ${item.guruNama}`}
                          value={item.supervisor}
                          onChange={(e) => handleSupervisorQuickChange(item, e.target.value)}
                          className="w-full min-w-[190px] max-w-[230px] text-xs font-medium px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
                        >
                          {!supervisorOptions.some((opt) => opt.value === item.supervisor) && (
                            <option value={item.supervisor}>{item.supervisor}</option>
                          )}
                          {supervisorOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium">{item.supervisor}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs">
                      <p className="line-clamp-2 italic text-[11px]">{item.fokusObservasi}</p>
                      {item.catatan && (
                        <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium">
                          {item.catatan}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          item.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Sedang Berlangsung'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : item.status === 'Ditunda'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isGuru ? (
                          <button
                            onClick={() => setActiveTab('supervisi_pembelajaran')}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Buka Lembar Observasi KBM"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Observasi</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab('pra_observasi')}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Buka Lembar Pra-Observasi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Pra-Observasi</span>
                          </button>
                        )}

                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Jadwal Visitasi"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {item.status !== 'Selesai' && (
                              <button
                                onClick={() => onUpdateScheduleStatus(item.id, 'Selesai')}
                                className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs cursor-pointer"
                                title="Tandai Selesai"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Hapus jadwal visitasi ini?')) {
                                  onDeleteSchedule(item.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Schedule */}
      {canManage && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
              {editingSchedule
                ? 'Edit Jadwal Visitasi Kelas'
                : 'Jadwalkan Kunjungan Supervisi Kelas'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Guru Sasaran</label>
                <select
                  value={selectedGuruId}
                  onChange={(e) => setSelectedGuruId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama}, {t.gelar} - {t.mapel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tanggal Visitasi</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Ruang Kelas</label>
                  <input
                    type="text"
                    required
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Contoh: XI MIPA 1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Jam Pelajaran</label>
                <input
                  type="text"
                  required
                  value={jamKe}
                  onChange={(e) => setJamKe(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: Jam ke 3-4 (08.45 - 10.15)"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Supervisor Pengamat (Sesuai Data Guru)
                </label>
                <select
                  required
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                >
                  {!supervisorOptions.some((opt) => opt.value === supervisor) && supervisor && (
                    <option value={supervisor}>{supervisor}</option>
                  )}
                  {supervisorOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {editingSchedule && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Jadwal</label>
                  <select
                    value={statusInput}
                    onChange={(e) =>
                      setStatusInput(e.target.value as VisitationSchedule['status'])
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Sedang Berlangsung">Sedang Berlangsung</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditunda">Ditunda</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fokus Khusus Pengamatan</label>
                <textarea
                  rows={2}
                  required
                  value={fokusObservasi}
                  onChange={(e) => setFokusObservasi(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Contoh: Pembelajaran diferensiasi, interaksi tanya jawab, penggunaan media..."
                />
              </div>

              {editingSchedule && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Catatan (Opsional)</label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Tambahkan catatan singkat..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSchedule(null);
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl cursor-pointer"
                >
                  {editingSchedule ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
