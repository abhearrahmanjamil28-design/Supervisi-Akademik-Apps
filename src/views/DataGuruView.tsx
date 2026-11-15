import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
  Eye,
  GraduationCap
} from 'lucide-react';
import { Teacher, User, VisitationSchedule } from '../types/supervisi';
import { NavTab } from '../components/Sidebar';

interface DataGuruViewProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  currentUser: User;
  schedules: VisitationSchedule[];
  setActiveTab: (tab: NavTab) => void;
  onSelectGuruForSupervisi?: (guruId: string) => void;
}

export const DataGuruView: React.FC<DataGuruViewProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  currentUser,
  schedules,
  setActiveTab,
}) => {
  const [search, setSearch] = useState('');
  const [filterMapel, setFilterMapel] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Teacher>>({
    nama: '',
    gelar: 'S.Pd.',
    nip: '',
    nuptk: '',
    jenisKelamin: 'L',
    mapel: '',
    kelas: ['X-1'],
    statusKepegawaian: 'GTY',
    pendidikanTerakhir: 'S1 Pendidikan',
    telepon: '0812-',
    email: '',
    username: '',
    password: '',
    totalJamMengajar: 24,
  });

  const canManage = currentUser.role === 'admin';

  useEffect(() => {
    if (!canManage && isModalOpen) {
      setIsModalOpen(false);
      setEditingTeacher(null);
    }
  }, [canManage, isModalOpen]);

  const mapelList = Array.from(new Set(teachers.map((t) => t.mapel)));

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.nama.toLowerCase().includes(search.toLowerCase()) ||
      t.mapel.toLowerCase().includes(search.toLowerCase()) ||
      t.nip.includes(search);
    const matchMapel = filterMapel === 'ALL' || t.mapel === filterMapel;
    return matchSearch && matchMapel;
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      nama: '',
      gelar: 'S.Pd.',
      nip: '',
      nuptk: '',
      jenisKelamin: 'L',
      mapel: '',
      kelas: ['X-1', 'XI MIPA 1'],
      statusKepegawaian: 'GTY',
      pendidikanTerakhir: 'S1 Pendidikan',
      telepon: '08',
      email: '',
      username: '',
      password: '',
      totalJamMengajar: 24,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      ...t,
      username: t.username || (t.email ? t.email.split('@')[0] : ''),
      password: t.password || 'guru1234',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !formData.nama || !formData.mapel) return;

    const fallbackEmail =
      formData.email || `${formData.nama?.toLowerCase().replace(/\s+/g, '.')}@smaplusuq.sch.id`;
    const resolvedUsername =
      formData.username?.trim() ||
      (fallbackEmail ? fallbackEmail.split('@')[0] : formData.nama?.toLowerCase().replace(/\s+/g, '.')) ||
      '';
    const resolvedPassword = formData.password?.trim() || 'guru1234';

    if (editingTeacher) {
      onUpdateTeacher({
        ...(formData as Teacher),
        id: editingTeacher.id,
        username: resolvedUsername,
        password: resolvedPassword,
      });
    } else {
      const newTeacher: Teacher = {
        ...(formData as Teacher),
        id: `guru-${Date.now()}`,
        kelas: typeof formData.kelas === 'string' ? (formData.kelas as string).split(',').map((s) => s.trim()) : formData.kelas || ['X-1'],
        email: fallbackEmail,
        username: resolvedUsername,
        password: resolvedPassword,
      };
      onAddTeacher(newTeacher);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Direktori Guru & Tenaga Pendidik</h2>
          <p className="text-xs text-gray-500">
            Daftar seluruh pendidik SMA Plus UQ Al-Mustofa sasaran supervisi akademik
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Guru</span>
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, mapel, NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="ALL">Semua Mata Pelajaran</option>
            {mapelList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => {
          const schedule = schedules.find((s) => s.guruId === teacher.id);
          const isSupervised = schedule?.status === 'Selesai';

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                      {teacher.nama.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 leading-tight">
                        {teacher.nama}, {teacher.gelar}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                        {teacher.mapel}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isSupervised
                        ? 'bg-emerald-100 text-emerald-800'
                        : schedule
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isSupervised ? 'Tersupervisi' : schedule ? 'Terjadwal' : 'Belum Visitasi'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400">NIP:</span>
                    <span className="font-mono text-gray-800">{teacher.nip || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status Pegawai:</span>
                    <span className="font-semibold text-gray-800">{teacher.statusKepegawaian}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pendidikan:</span>
                    <span className="text-gray-800 truncate max-w-[180px] text-right">
                      {teacher.pendidikanTerakhir}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Beban Ajar:</span>
                    <span className="font-bold text-gray-800">{teacher.totalJamMengajar} Jam / Pekan</span>
                  </div>
                  {canManage && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Username:</span>
                      <span className="font-mono text-emerald-800 font-semibold">
                        {teacher.username || teacher.email.split('@')[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {teacher.kelas.map((k) => (
                    <span
                      key={k}
                      className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveTab('supervisi_pembelajaran')}
                  className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Supervisi</span>
                </button>

                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(teacher)}
                      className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data Guru"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus data ${teacher.nama}?`)) {
                          onDeleteTeacher(teacher.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {canManage && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100">
              {editingTeacher ? 'Ubah Data Guru' : 'Tambah Guru Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap (tanpa gelar)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzan"
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Gelar Akademik</label>
                  <input
                    type="text"
                    placeholder="Contoh: S.Pd., M.Si."
                    value={formData.gelar || ''}
                    onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Matematika"
                    value={formData.mapel || ''}
                    onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">NIP</label>
                  <input
                    type="text"
                    placeholder="18 digit NIP"
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">NUPTK</label>
                  <input
                    type="text"
                    placeholder="16 digit NUPTK"
                    value={formData.nuptk || ''}
                    onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.statusKepegawaian || 'GTY'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statusKepegawaian: e.target.value as Teacher['statusKepegawaian'],
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="GTY">Guru Tetap Yayasan (GTY)</option>
                    <option value="GTT">Guru Tidak Tetap (GTT)</option>
                    <option value="PNS">Pegawai Negeri Sipil (PNS DPK)</option>
                    <option value="PPPK">PPPK</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Jam Mengajar</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalJamMengajar || 24}
                    onChange={(e) =>
                      setFormData({ ...formData, totalJamMengajar: Number(e.target.value) })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Pendidikan Terakhir &amp; Kampus</label>
                <input
                  type="text"
                  placeholder="Contoh: S1 Pendidikan Biologi (UPI)"
                  value={formData.pendidikanTerakhir || ''}
                  onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Username Akun Guru</label>
                  <input
                    type="text"
                    placeholder="Contoh: siti.nurhaliza"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Password Akun Guru</label>
                  <input
                    type="text"
                    placeholder="Contoh: guru1234"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg font-mono"
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
                  {editingTeacher ? 'Simpan Perubahan' : 'Tambahkan Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
