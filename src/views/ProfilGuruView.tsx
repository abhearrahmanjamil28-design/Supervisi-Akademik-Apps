import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Building2,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Target,
  Sparkles,
  Calendar,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import {
  Teacher,
  User,
  SchoolProfile,
  TeacherPersonalProfile,
} from '../types/supervisi';

interface ProfilGuruViewProps {
  currentUser: User;
  teachers: Teacher[];
  school: SchoolProfile;
  teacherProfiles: TeacherPersonalProfile[];
  onSaveTeacherProfile: (profile: TeacherPersonalProfile) => void;
}

export const ProfilGuruView: React.FC<ProfilGuruViewProps> = ({
  currentUser,
  teachers,
  school,
  teacherProfiles,
  onSaveTeacherProfile,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Match logged-in guru against Admin's Data Guru
  const matchedTeacher = teachers.find(
    (t) =>
      t.id === currentUser.id ||
      (currentUser.nip && t.nip === currentUser.nip) ||
      (currentUser.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (t.username &&
        currentUser.email &&
        t.username.toLowerCase() === currentUser.email.toLowerCase())
  );

  const guruId = matchedTeacher?.id || currentUser.id;
  const existingProfile = teacherProfiles.find((p) => p.guruId === guruId);

  const buildInitialProfile = (): TeacherPersonalProfile => {
    const defaultGender: 'Laki-laki' | 'Perempuan' | '' =
      matchedTeacher?.jenisKelamin === 'L'
        ? 'Laki-laki'
        : matchedTeacher?.jenisKelamin === 'P'
        ? 'Perempuan'
        : '';

    return {
      guruId,
      tempatTanggalLahir: existingProfile?.tempatTanggalLahir || '',
      jenisKelamin: existingProfile?.jenisKelamin || defaultGender,
      pendidikanTerakhir:
        existingProfile?.pendidikanTerakhir || matchedTeacher?.pendidikanTerakhir || '',
      nuptk: existingProfile?.nuptk || matchedTeacher?.nuptk || '',
      noRekening: existingProfile?.noRekening || '',
      namaBank: existingProfile?.namaBank || '',
      tempatTugas: existingProfile?.tempatTugas || school.namaSekolah || '',
      tanggalMulaiTugas: existingProfile?.tanggalMulaiTugas || '',
      masaKerja: existingProfile?.masaKerja || '',
      alamat: existingProfile?.alamat || '',
      nomorHandphone: existingProfile?.nomorHandphone || matchedTeacher?.telepon || '',
      email: existingProfile?.email || matchedTeacher?.email || currentUser.email || '',
      visi: existingProfile?.visi || '',
      misi: existingProfile?.misi || '',
      mottoHidup: existingProfile?.mottoHidup || '',
      updatedAt: existingProfile?.updatedAt,
    };
  };

  const [formData, setFormData] = useState<TeacherPersonalProfile>(buildInitialProfile);

  useEffect(() => {
    setFormData(buildInitialProfile());
    setShowPassword(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guruId, existingProfile]);

  // Locked fields from Admin's Data Guru
  const lockedNama = matchedTeacher
    ? `${matchedTeacher.nama}${matchedTeacher.gelar ? `, ${matchedTeacher.gelar}` : ''}`
    : currentUser.name;
  const lockedUsername =
    matchedTeacher?.username ||
    (matchedTeacher?.email ? matchedTeacher.email.split('@')[0] : currentUser.email.split('@')[0]);
  const lockedPassword = matchedTeacher?.password || 'guru1234';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TeacherPersonalProfile = {
      ...formData,
      guruId,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveTeacherProfile(updated);
    setSaveMessage('Profil guru berhasil disimpan!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-xl flex items-center justify-center shadow-sm shrink-0">
            {lockedNama.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Profil Guru</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                <UserCheck className="w-3 h-3" />
                {matchedTeacher?.mapel || currentUser.subject || 'Pendidik'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Nama, Username, dan Password disinkronkan dari Data Guru Admin (terkunci). Data lainnya dapat diisi langsung secara mandiri.
            </p>
          </div>
        </div>

        {formData.updatedAt && (
          <div className="text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 shrink-0">
            Terakhir diperbarui: <strong className="text-gray-800">{formData.updatedAt}</strong>
          </div>
        )}
      </div>

      {saveMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Locked Account Credentials from Admin Data Guru */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Data Akun Guru (Dari Data Guru Laman Admin)</span>
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold self-start sm:self-auto">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Dikunci • Hanya Bisa Dilihat</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Nama */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Nama</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={lockedNama}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-gray-800 cursor-not-allowed select-all"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Username</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={lockedUsername}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-semibold text-gray-800 cursor-not-allowed select-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                <span>Password</span>
                <Lock className="w-3 h-3 text-slate-400" />
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly
                  disabled
                  value={lockedPassword}
                  className="w-full p-2.5 pr-10 bg-slate-100 border border-slate-200 rounded-xl font-mono font-semibold text-gray-800 cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-emerald-700 rounded cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Self-Editable Biodata & Employment Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card: Biodata & Kepegawaian */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-100">
              <GraduationCap className="w-4 h-4 text-emerald-700" />
              <span>Biodata &amp; Data Kepegawaian</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tempat/Tanggal Lahir
                </label>
                <input
                  type="text"
                  value={formData.tempatTanggalLahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tempatTanggalLahir: e.target.value })
                  }
                  placeholder="Contoh: Sumedang, 15 Mei 1990"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jenisKelamin: e.target.value as TeacherPersonalProfile['jenisKelamin'],
                    })
                  }
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">-- Pilih Jenis Kelamin --</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Pendidikan Terakhir
                </label>
                <input
                  type="text"
                  value={formData.pendidikanTerakhir}
                  onChange={(e) =>
                    setFormData({ ...formData, pendidikanTerakhir: e.target.value })
                  }
                  placeholder="Contoh: S1 Pendidikan Fisika"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">NUPTK</label>
                <input
                  type="text"
                  value={formData.nuptk}
                  onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                  placeholder="16 digit NUPTK"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>No. Rekening</span>
                </label>
                <input
                  type="text"
                  value={formData.noRekening}
                  onChange={(e) => setFormData({ ...formData, noRekening: e.target.value })}
                  placeholder="Masukkan nomor rekening"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={formData.namaBank}
                  onChange={(e) => setFormData({ ...formData, namaBank: e.target.value })}
                  placeholder="Contoh: Bank BJB / Mandiri / BRI"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tempat Tugas</span>
              </label>
              <input
                type="text"
                value={formData.tempatTugas}
                onChange={(e) => setFormData({ ...formData, tempatTugas: e.target.value })}
                placeholder="Contoh: SMA Plus UQ Al-Mustofa"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tanggal Mulai Tugas</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggalMulaiTugas}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggalMulaiTugas: e.target.value })
                  }
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Masa Kerja</label>
                <input
                  type="text"
                  value={formData.masaKerja}
                  onChange={(e) => setFormData({ ...formData, masaKerja: e.target.value })}
                  placeholder="Contoh: 5 Tahun 4 Bulan"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Right Card: Kontak, Alamat, Visi, Misi & Motto Hidup */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-100">
              <Target className="w-4 h-4 text-emerald-700" />
              <span>Kontak, Alamat &amp; Visi Misi Pendidik</span>
            </h3>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alamat</span>
              </label>
              <textarea
                rows={2}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Masukkan alamat tempat tinggal lengkap..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nomor Handphone</span>
                </label>
                <input
                  type="text"
                  value={formData.nomorHandphone}
                  onChange={(e) =>
                    setFormData({ ...formData, nomorHandphone: e.target.value })
                  }
                  placeholder="0812-xxxx-xxxx"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>E-Mail</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Visi</label>
              <textarea
                rows={2}
                value={formData.visi}
                onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                placeholder="Tuliskan visi pribadi sebagai pendidik..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Misi</label>
              <textarea
                rows={2}
                value={formData.misi}
                onChange={(e) => setFormData({ ...formData, misi: e.target.value })}
                placeholder="Tuliskan misi pembelajaran dan pembinaan..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Motto Hidup</span>
              </label>
              <input
                type="text"
                value={formData.mottoHidup}
                onChange={(e) => setFormData({ ...formData, mottoHidup: e.target.value })}
                placeholder="Contoh: Mendidik dengan hati, menginspirasi dengan keteladanan"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Pastikan data yang diisi secara mandiri sudah benar sebelum disimpan.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#065f46] hover:bg-[#044e3a] active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Profil Guru</span>
          </button>
        </div>
      </form>
    </div>
  );
};
