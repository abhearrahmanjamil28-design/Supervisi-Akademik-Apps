import React, { useState, useEffect } from 'react';
import {
  School,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  Edit3,
  Save,
  CheckCircle2,
  Users,
  Plus,
  Trash2,
  Target,
  X,
  Calendar,
  Power
} from 'lucide-react';
import { SchoolProfile, User, AcademicPeriod } from '../types/supervisi';

interface ProfilSekolahViewProps {
  school: SchoolProfile;
  onUpdateSchool: (updated: SchoolProfile) => void;
  academicPeriods: AcademicPeriod[];
  onUpdateAcademicPeriods: (periods: AcademicPeriod[]) => void;
  currentUser: User;
}

export const ProfilSekolahView: React.FC<ProfilSekolahViewProps> = ({
  school,
  onUpdateSchool,
  academicPeriods,
  onUpdateAcademicPeriods,
  currentUser,
}) => {
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [isEditingVisiMisi, setIsEditingVisiMisi] = useState(false);
  const [isEditingKontak, setIsEditingKontak] = useState(false);
  const [formData, setFormData] = useState<SchoolProfile>({ ...school });
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Academic Period add form state
  const [isAddingPeriod, setIsAddingPeriod] = useState(false);
  const [newTahunAjaran, setNewTahunAjaran] = useState('2027/2028');
  const [newSemester, setNewSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [newStatus, setNewStatus] = useState<'Aktif' | 'Off'>('Aktif');

  useEffect(() => {
    setFormData({ ...school });
  }, [school]);

  const canEdit = currentUser.role === 'admin';

  useEffect(() => {
    if (!canEdit) {
      setIsEditingAll(false);
      setIsEditingVisiMisi(false);
      setIsEditingKontak(false);
      setIsAddingPeriod(false);
    }
  }, [canEdit]);

  const triggerSuccess = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData: SchoolProfile = {
      ...formData,
      misi: formData.misi.map((m) => m.trim()).filter(Boolean),
      tujuan: (formData.tujuan || []).map((t) => t.trim()).filter(Boolean),
    };
    onUpdateSchool(cleanedData);
    setIsEditingAll(false);
    setIsEditingVisiMisi(false);
    setIsEditingKontak(false);
    triggerSuccess('Seluruh profil sekolah berhasil diperbarui dan tersimpan!');
  };

  const handleCancelAll = () => {
    setFormData({ ...school });
    setIsEditingAll(false);
    setIsEditingVisiMisi(false);
    setIsEditingKontak(false);
  };

  // Dedicated Save / Cancel for Visi, Misi & Sasaran Mutu
  const handleSaveVisiMisi = () => {
    const cleanedMisi = formData.misi.map((m) => m.trim()).filter(Boolean);
    const cleanedTujuan = (formData.tujuan || []).map((t) => t.trim()).filter(Boolean);
    const updated: SchoolProfile = {
      ...school,
      visi: formData.visi.trim(),
      misi: cleanedMisi,
      tujuan: cleanedTujuan,
    };
    onUpdateSchool(updated);
    setFormData((prev) => ({
      ...prev,
      visi: updated.visi,
      misi: updated.misi,
      tujuan: updated.tujuan,
    }));
    setIsEditingVisiMisi(false);
    triggerSuccess('Visi, Misi, dan Sasaran Mutu berhasil diperbarui!');
  };

  const handleCancelVisiMisi = () => {
    setFormData((prev) => ({
      ...prev,
      visi: school.visi,
      misi: [...school.misi],
      tujuan: [...(school.tujuan || [])],
    }));
    setIsEditingVisiMisi(false);
  };

  // Dedicated Save / Cancel for Kontak Resmi
  const handleSaveKontak = () => {
    const updated: SchoolProfile = {
      ...school,
      telepon: formData.telepon.trim(),
      email: formData.email.trim(),
      website: formData.website.trim(),
    };
    onUpdateSchool(updated);
    setFormData((prev) => ({
      ...prev,
      telepon: updated.telepon,
      email: updated.email,
      website: updated.website,
    }));
    setIsEditingKontak(false);
    triggerSuccess('Kontak resmi sekolah berhasil diperbarui!');
  };

  const handleCancelKontak = () => {
    setFormData((prev) => ({
      ...prev,
      telepon: school.telepon,
      email: school.email,
      website: school.website,
    }));
    setIsEditingKontak(false);
  };

  // Misi list helpers
  const handleMisiChange = (idx: number, val: string) => {
    const next = [...formData.misi];
    next[idx] = val;
    setFormData({ ...formData, misi: next });
  };

  const handleAddMisi = () => {
    setFormData({ ...formData, misi: [...formData.misi, ''] });
  };

  const handleRemoveMisi = (idx: number) => {
    const next = formData.misi.filter((_, i) => i !== idx);
    setFormData({ ...formData, misi: next });
  };

  // Sasaran Mutu (Tujuan) list helpers
  const handleTujuanChange = (idx: number, val: string) => {
    const next = [...(formData.tujuan || [])];
    next[idx] = val;
    setFormData({ ...formData, tujuan: next });
  };

  const handleAddTujuan = () => {
    setFormData({ ...formData, tujuan: [...(formData.tujuan || []), ''] });
  };

  const handleRemoveTujuan = (idx: number) => {
    const next = (formData.tujuan || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, tujuan: next });
  };

  // Academic Period management helpers
  const handleAddPeriod = () => {
    const trimmedYear = newTahunAjaran.trim();
    if (!trimmedYear) return;

    const alreadyExists = academicPeriods.some(
      (p) =>
        p.tahunAjaran.toLowerCase() === trimmedYear.toLowerCase() &&
        p.semester === newSemester
    );

    if (alreadyExists) {
      const updated = academicPeriods.map((p) => {
        const isMatch =
          p.tahunAjaran.toLowerCase() === trimmedYear.toLowerCase() &&
          p.semester === newSemester;
        if (newStatus === 'Aktif') {
          return { ...p, status: (isMatch ? 'Aktif' : 'Off') as 'Aktif' | 'Off' };
        }
        return isMatch ? { ...p, status: 'Off' as const } : p;
      });
      onUpdateAcademicPeriods(updated);
      setIsAddingPeriod(false);
      triggerSuccess(
        `Tahun Pelajaran ${trimmedYear} (${newSemester}) diperbarui ke status ${newStatus}.`
      );
      return;
    }

    const created: AcademicPeriod = {
      id: `ap-${Date.now()}`,
      tahunAjaran: trimmedYear,
      semester: newSemester,
      status: newStatus,
    };

    const nextList =
      newStatus === 'Aktif'
        ? [
            ...academicPeriods.map((p) => ({ ...p, status: 'Off' as const })),
            created,
          ]
        : [...academicPeriods, created];

    onUpdateAcademicPeriods(nextList);
    setIsAddingPeriod(false);
    setNewTahunAjaran('');
    triggerSuccess(
      `Tahun Pelajaran ${trimmedYear} (${newSemester}) berhasil ditambahkan (${newStatus}).`
    );
  };

  const handleSetPeriodStatus = (periodId: string, status: 'Aktif' | 'Off') => {
    const target = academicPeriods.find((p) => p.id === periodId);
    if (!target) return;

    const updated = academicPeriods.map((p) => {
      if (status === 'Aktif') {
        return { ...p, status: (p.id === periodId ? 'Aktif' : 'Off') as 'Aktif' | 'Off' };
      }
      return p.id === periodId ? { ...p, status: 'Off' as const } : p;
    });

    onUpdateAcademicPeriods(updated);
    triggerSuccess(
      status === 'Aktif'
        ? `Tahun Pelajaran ${target.tahunAjaran} Semester ${target.semester} sekarang AKTIF untuk seluruh aplikasi.`
        : `Tahun Pelajaran ${target.tahunAjaran} Semester ${target.semester} diatur ke status OFF.`
    );
  };

  const handleDeletePeriod = (periodId: string) => {
    if (academicPeriods.length <= 1) return;
    const next = academicPeriods.filter((p) => p.id !== periodId);
    onUpdateAcademicPeriods(next);
    triggerSuccess('Entri Tahun Pelajaran & Semester dihapus.');
  };

  const visiMisiEditable = isEditingAll || isEditingVisiMisi;
  const kontakEditable = isEditingAll || isEditingKontak;

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-xs">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{school.namaSekolah}</h2>
            <p className="text-xs text-gray-500">
              NPSN: {school.npsn} • NSS: {school.nss} • Status: {school.status}
            </p>
          </div>
        </div>

        {canEdit && (
          <div>
            {isEditingAll ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelAll}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Perubahan</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditingAll(true);
                  setIsEditingVisiMisi(false);
                  setIsEditingKontak(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Ubah Semua Data Sekolah</span>
              </button>
            )}
          </div>
        )}
      </div>

      {saveMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Details Grid */}
      <form onSubmit={handleSaveAll} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Identity & Visi Misi Sasaran Mutu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <Building className="w-4 h-4 text-emerald-600" />
              Identitas & Legalitas Sekolah
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Satuan Pendidikan
                </label>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.namaSekolah}
                  onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                  className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor Pokok Sekolah Nasional (NPSN)
                </label>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Akreditasi Sekolah
                </label>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.akreditasi}
                  onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                  className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kurikulum Operasional
                </label>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.kurikulum}
                  onChange={(e) => setFormData({ ...formData, kurikulum: e.target.value })}
                  className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Alamat Lengkap
              </label>
              <textarea
                rows={2}
                disabled={!isEditingAll}
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-gray-500 text-[11px]">Kecamatan</span>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <span className="text-gray-500 text-[11px]">Kab/Kota</span>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.kabupatenKota}
                  onChange={(e) => setFormData({ ...formData, kabupatenKota: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <span className="text-gray-500 text-[11px]">Provinsi</span>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.provinsi}
                  onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <span className="text-gray-500 text-[11px]">Kode Pos</span>
                <input
                  type="text"
                  disabled={!isEditingAll}
                  value={formData.kodePos}
                  onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                  className="w-full mt-1 p-2 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Visi, Misi & Sasaran Mutu */}
          <div
            className={`bg-white p-6 rounded-2xl border shadow-xs space-y-5 transition-all ${
              visiMisiEditable ? 'border-emerald-400 ring-2 ring-emerald-500/10' : 'border-gray-100'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Visi, Misi & Sasaran Mutu
              </h3>

              {canEdit && !isEditingAll && (
                <div className="flex items-center gap-2">
                  {isEditingVisiMisi ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelVisiMisi}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Batal</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveVisiMisi}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingVisiMisi(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Visi, Misi & Sasaran Mutu</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Visi Sekolah */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Visi Sekolah
              </label>
              {visiMisiEditable ? (
                <textarea
                  rows={3}
                  value={formData.visi}
                  onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                  placeholder="Tuliskan visi satuan pendidikan..."
                  className="w-full text-xs p-3 bg-white border border-emerald-300 rounded-xl font-medium text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs font-medium text-emerald-950 leading-relaxed">
                  "{school.visi}"
                </div>
              )}
            </div>

            {/* Misi Satuan Pendidikan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700">
                  Misi Satuan Pendidikan
                </label>
                {visiMisiEditable && (
                  <button
                    type="button"
                    onClick={handleAddMisi}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Misi</span>
                  </button>
                )}
              </div>

              {visiMisiEditable ? (
                <div className="space-y-2">
                  {formData.misi.map((m, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-1.5">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={m}
                        onChange={(e) => handleMisiChange(idx, e.target.value)}
                        placeholder={`Uraian misi ke-${idx + 1}...`}
                        className="flex-1 text-xs p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMisi(idx)}
                        title="Hapus poin misi"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer mt-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.misi.length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      Belum ada poin misi. Klik "Tambah Misi" untuk menambahkan.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="space-y-2">
                  {school.misi.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sasaran Mutu / Tujuan */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  Sasaran Mutu & Tujuan Sekolah
                </label>
                {visiMisiEditable && (
                  <button
                    type="button"
                    onClick={handleAddTujuan}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Sasaran Mutu</span>
                  </button>
                )}
              </div>

              {visiMisiEditable ? (
                <div className="space-y-2">
                  {(formData.tujuan || []).map((t, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-1.5">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={t}
                        onChange={(e) => handleTujuanChange(idx, e.target.value)}
                        placeholder={`Sasaran mutu ke-${idx + 1}...`}
                        className="flex-1 text-xs p-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTujuan(idx)}
                        title="Hapus sasaran mutu"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer mt-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(formData.tujuan || []).length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      Belum ada sasaran mutu. Klik "Tambah Sasaran Mutu" untuk menambahkan.
                    </p>
                  )}
                </div>
              ) : (
                <ul className="space-y-2">
                  {(school.tujuan || []).map((t, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Officials and Official Contact */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-gray-100">
              <Users className="w-4 h-4 text-emerald-600" />
              Pimpinan & Pengawas
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kepala Sekolah
              </label>
              <input
                type="text"
                disabled={!isEditingAll}
                value={formData.kepalaSekolah}
                onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg font-bold"
              />
              {isEditingAll ? (
                <div className="mt-1.5">
                  <span className="text-[11px] text-gray-500">NIP Kepala Sekolah</span>
                  <input
                    type="text"
                    value={formData.nipKepalaSekolah}
                    onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                    className="w-full mt-0.5 text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono"
                  />
                </div>
              ) : (
                <span className="text-[11px] text-gray-500 mt-1 block">
                  NIP: {formData.nipKepalaSekolah}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Pengawas Pembina
              </label>
              <input
                type="text"
                disabled={!isEditingAll}
                value={formData.pengawasPembina}
                onChange={(e) => setFormData({ ...formData, pengawasPembina: e.target.value })}
                className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-100/70 border border-gray-200 rounded-lg font-bold"
              />
              {isEditingAll ? (
                <div className="mt-1.5">
                  <span className="text-[11px] text-gray-500">NIP Pengawas Pembina</span>
                  <input
                    type="text"
                    value={formData.nipPengawas}
                    onChange={(e) => setFormData({ ...formData, nipPengawas: e.target.value })}
                    className="w-full mt-0.5 text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono"
                  />
                </div>
              ) : (
                <span className="text-[11px] text-gray-500 mt-1 block">
                  NIP: {formData.nipPengawas}
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tahun Pelajaran &amp; Semester</span>
                </label>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPeriod((prev) => !prev);
                      setNewTahunAjaran('');
                      setNewSemester('Ganjil');
                      setNewStatus('Aktif');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah</span>
                  </button>
                )}
              </div>

              {/* Currently Active Banner (shown for Admin always; for Kepala Sekolah/Guru only if Aktif) */}
              {canEdit ? (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                    school.periodeStatus === 'Off'
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <Power
                      className={`w-3.5 h-3.5 ${
                        school.periodeStatus === 'Off' ? 'text-slate-500' : 'text-emerald-600'
                      }`}
                    />
                    <span>
                      TA {school.tahunAjaran} • {school.semester}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      school.periodeStatus === 'Off'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {school.periodeStatus === 'Off' ? 'Off' : 'Aktif'}
                  </span>
                </div>
              ) : null}

              {/* Inline Add New Academic Period Form (Admin only) */}
              {canEdit && isAddingPeriod && (
                <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-2.5 text-xs">
                  <div className="font-semibold text-emerald-950 text-[11px]">
                    Input Tahun Ajaran &amp; Semester Baru
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newTahunAjaran}
                      onChange={(e) => setNewTahunAjaran(e.target.value)}
                      placeholder="Contoh: 2027/2028"
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <select
                      value={newSemester}
                      onChange={(e) =>
                        setNewSemester(e.target.value as 'Ganjil' | 'Genap')
                      }
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-600 font-medium">Status:</span>
                      <select
                        value={newStatus}
                        onChange={(e) =>
                          setNewStatus(e.target.value as 'Aktif' | 'Off')
                        }
                        className="p-1.5 bg-white border border-gray-300 rounded-lg text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="Aktif">Aktif</option>
                        <option value="Off">Off</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddingPeriod(false)}
                        className="px-2.5 py-1 border border-gray-200 bg-white text-gray-600 rounded-lg text-[11px] font-semibold hover:bg-gray-50 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleAddPeriod}
                        className="px-3 py-1 bg-[#064e3b] hover:bg-[#033c2a] text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* List of Tahun Ajaran & Semester (Admin sees all; Kepala Sekolah sees ONLY activated) */}
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
                {(() => {
                  const displayedPeriods = canEdit
                    ? academicPeriods
                    : academicPeriods.filter((p) => p.status === 'Aktif');

                  if (displayedPeriods.length === 0) {
                    return (
                      <div className="p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                        Belum ada tahun ajaran yang diaktifkan.
                      </div>
                    );
                  }

                  return displayedPeriods.map((period) => {
                    const isActive = period.status === 'Aktif';
                    return (
                      <div
                        key={period.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                          isActive
                            ? 'bg-emerald-50/40 border-emerald-300'
                            : 'bg-gray-50/70 border-gray-200/80'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">
                            {period.tahunAjaran}
                          </div>
                          <div className="text-[11px] text-gray-500 font-medium">
                            Semester {period.semester}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {canEdit ? (
                            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() => handleSetPeriodStatus(period.id, 'Aktif')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                Aktif
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetPeriodStatus(period.id, 'Off')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                                  !isActive
                                    ? 'bg-slate-600 text-white shadow-2xs'
                                    : 'text-gray-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                Off
                              </button>
                            </div>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase">
                              Aktif
                            </span>
                          )}

                          {canEdit && academicPeriods.length > 1 && !isActive && (
                            <button
                              type="button"
                              onClick={() => handleDeletePeriod(period.id)}
                              title="Hapus periode ini"
                              className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Kontak Resmi */}
          <div
            className={`bg-white p-6 rounded-2xl border shadow-xs space-y-4 transition-all ${
              kontakEditable ? 'border-emerald-400 ring-2 ring-emerald-500/10' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Kontak Resmi
              </h3>

              {canEdit && !isEditingAll && (
                <div>
                  {isEditingKontak ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleCancelKontak}
                        title="Batal"
                        className="p-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveKontak}
                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingKontak(true)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {kontakEditable ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="(021) 7788-9922"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@sekolah.sch.id"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    Website / Laman Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://sekolah.sch.id"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{school.telepon}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="break-all">{school.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline break-all"
                  >
                    {school.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
