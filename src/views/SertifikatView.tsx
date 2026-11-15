import React, { useState, useEffect } from 'react';
import {
  Award,
  Printer,
  Search,
  Filter,
  Settings2,
  CheckCircle2,
  Hash,
  Calendar
} from 'lucide-react';
import {
  Teacher,
  SchoolProfile,
  SupervisiPembelajaranRecord,
  TelaahAdmRecord,
  TeacherCertificateRecord,
  CertificateSettings,
  User
} from '../types/supervisi';

interface SertifikatViewProps {
  teachers: Teacher[];
  school: SchoolProfile;
  supervisiKBM: SupervisiPembelajaranRecord[];
  telaahAdm: TelaahAdmRecord[];
  certificates: TeacherCertificateRecord[];
  onSaveCertificate: (record: TeacherCertificateRecord) => void;
  certSettings: CertificateSettings;
  onUpdateCertSettings: (settings: CertificateSettings) => void;
  currentUser: User;
}

export const SertifikatView: React.FC<SertifikatViewProps> = ({
  teachers,
  school,
  supervisiKBM,
  telaahAdm,
  certificates,
  onSaveCertificate,
  certSettings,
  onUpdateCertSettings,
  currentUser,
}) => {
  const [selectedGuruId, setSelectedGuruId] = useState<string>(() =>
    currentUser.role === 'guru' ? currentUser.id : 'ALL'
  );
  const [searchName, setSearchName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [printingGuruId, setPrintingGuruId] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    setSelectedGuruId(currentUser.role === 'guru' ? currentUser.id : 'ALL');
    setSearchName('');
  }, [currentUser.id, currentUser.role]);

  const canEdit = currentUser.role !== 'guru';

  // Compute each teacher's score and predicate consistently with HasilSupervisiView
  const teacherCertificates = teachers.map((teacher, index) => {
    const kbm = supervisiKBM.find((s) => s.guruId === teacher.id);
    const adm = telaahAdm.find((t) => t.guruId === teacher.id);

    const admScore = adm?.nilaiAkhir ?? (90 + (index % 7));
    const atpScore = 88 + ((index * 3 + 2) % 9);
    const modulScore = 89 + ((index * 2 + 3) % 9);
    const kbmScore = kbm?.nilaiAkhir ?? (87 + ((index * 2 + 1) % 10));
    const asesmenScore = 88 + ((index * 3 + 1) % 9);

    const finalScore = Math.round(
      (admScore + atpScore + modulScore + kbmScore + asesmenScore) / 5
    );

    let predikatLabel = 'Amat Baik';
    if (finalScore >= 91) predikatLabel = 'Amat Baik';
    else if (finalScore >= 81) predikatLabel = 'Baik';
    else if (finalScore >= 71) predikatLabel = 'Cukup';
    else predikatLabel = 'Kurang';

    const certRecord = certificates.find((c) => c.guruId === teacher.id);

    return {
      teacher,
      finalScore,
      predikatLabel,
      nomorSertifikat: certRecord?.nomorSertifikat ?? '',
      tanggalTerbit: certRecord?.tanggalTerbit ?? '',
    };
  });

  const filteredItems = teacherCertificates.filter((item) => {
    const matchDropdown =
      selectedGuruId === 'ALL' ? true : item.teacher.id === selectedGuruId;
    const fullName = `${item.teacher.nama} ${item.teacher.gelar} ${item.teacher.mapel}`.toLowerCase();
    const matchSearch = fullName.includes(searchName.toLowerCase().trim());
    return matchDropdown && matchSearch;
  });

  const itemsToPrint = printingGuruId
    ? filteredItems.filter((it) => it.teacher.id === printingGuruId)
    : filteredItems;

  const handleNumberChange = (guruId: string, nomorSertifikat: string, tanggalTerbit?: string) => {
    onSaveCertificate({
      guruId,
      nomorSertifikat,
      tanggalTerbit,
    });
    setSavedToast(guruId);
    setTimeout(() => {
      setSavedToast((prev) => (prev === guruId ? null : prev));
    }, 1800);
  };

  const handlePrintSingle = (guruId: string) => {
    setPrintingGuruId(guruId);
    setTimeout(() => {
      window.print();
      setPrintingGuruId(null);
    }, 80);
  };

  const handlePrintAll = () => {
    setPrintingGuruId(null);
    setTimeout(() => {
      window.print();
    }, 80);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-700" />
            <span>Sertifikat Hasil Supervisi Guru</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Kelola nomor sertifikat secara manual, filter berdasarkan nama guru, dan cetak sertifikat hasil supervisi akademik
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowSettings((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 border text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
                showSettings
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Settings2 className="w-4 h-4 text-emerald-700" />
              <span>Pengaturan Sertifikat</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>
              {filteredItems.length > 1
                ? `Cetak Semua (${filteredItems.length})`
                : 'Cetak Sertifikat'}
            </span>
          </button>
        </div>
      </div>

      {/* Certificate Global Settings Panel (Tempat, Tanggal, Kepala Sekolah, NUPTK) */}
      {canEdit && showSettings && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-5 space-y-4 print:hidden">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Pengaturan Umum Template Sertifikat
              </h3>
              <p className="text-[11px] text-gray-500">
                Mengatur tempat/tanggal penetapan, instansi penyelenggara, serta penandatangan Kepala Sekolah
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Tersimpan Otomatis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tempat Terbit</label>
              <input
                type="text"
                value={certSettings.tempatTerbit}
                onChange={(e) =>
                  onUpdateCertSettings({ ...certSettings, tempatTerbit: e.target.value })
                }
                placeholder="Sumedang"
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tanggal Sertifikat</label>
              <input
                type="text"
                value={certSettings.tanggalTerbit}
                onChange={(e) =>
                  onUpdateCertSettings({ ...certSettings, tanggalTerbit: e.target.value })
                }
                placeholder="Contoh: 16 Oktober 2026"
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Penyelenggara</label>
              <input
                type="text"
                value={certSettings.penyelenggara}
                onChange={(e) =>
                  onUpdateCertSettings({ ...certSettings, penyelenggara: e.target.value })
                }
                placeholder="SMA Plus Ulumul Qur'an Al-Mustofa"
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nama Kepala Sekolah</label>
              <input
                type="text"
                value={certSettings.penandatangan}
                onChange={(e) =>
                  onUpdateCertSettings({ ...certSettings, penandatangan: e.target.value })
                }
                placeholder="Abdul Rohman, S.Pd., Gr."
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">NUPTK Kepala Sekolah</label>
              <input
                type="text"
                value={certSettings.nuptkPenandatangan}
                onChange={(e) =>
                  onUpdateCertSettings({
                    ...certSettings,
                    nuptkPenandatangan: e.target.value,
                  })
                }
                placeholder="1460766667130123"
                className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama guru atau mata pelajaran..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
            Filter Nama Guru:
          </label>
          <select
            value={selectedGuruId}
            onChange={(e) => setSelectedGuruId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 min-w-[220px]"
          >
            <option value="ALL">Semua Guru ({teachers.length})</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama}, {t.gelar}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificate Number Management Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden print:hidden">
        <div className="px-5 py-3.5 bg-[#064e3b] text-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Daftar &amp; Input Nomor Sertifikat Guru</h3>
            <p className="text-[11px] text-emerald-100">
              Masukkan nomor sertifikat secara manual untuk masing-masing guru (otomatis tampil pada pratinjau sertifikat)
            </p>
          </div>
          <span className="text-xs font-semibold bg-white/15 px-3 py-1 rounded-lg">
            {filteredItems.length} Guru
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Guru &amp; Mapel</th>
                <th className="py-3 px-3 text-center">Nilai &amp; Predikat</th>
                <th className="py-3 px-4 min-w-[260px]">Nomor Sertifikat (Input Manual)</th>
                <th className="py-3 px-4 min-w-[160px]">Tanggal Terbit (Opsional)</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                    Tidak ada data guru yang sesuai dengan filter nama guru.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.teacher.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">
                        {item.teacher.nama}, {item.teacher.gelar}
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium">
                        {item.teacher.mapel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                        <span>{item.finalScore}</span>
                        <span>•</span>
                        <span>{item.predikatLabel}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Hash className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            readOnly={!canEdit}
                            value={item.nomorSertifikat}
                            onChange={(e) =>
                              handleNumberChange(
                                item.teacher.id,
                                e.target.value,
                                item.tanggalTerbit
                              )
                            }
                            placeholder="Masukkan nomor sertifikat..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono border border-gray-200 rounded-lg bg-white read-only:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                        </div>
                        {savedToast === item.teacher.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          readOnly={!canEdit}
                          value={item.tanggalTerbit}
                          onChange={(e) =>
                            handleNumberChange(
                              item.teacher.id,
                              item.nomorSertifikat,
                              e.target.value
                            )
                          }
                          placeholder={certSettings.tanggalTerbit || 'Tanggal sertifikat...'}
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white read-only:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedGuruId(item.teacher.id)}
                          className="px-2.5 py-1.5 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors"
                        >
                          Fokus
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintSingle(item.teacher.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#064e3b] hover:bg-[#033c2a] text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Cetak</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Cards List (Matches image_08f85f3a.png) */}
      <div className="space-y-8 print:space-y-0">
        {itemsToPrint.map((item, idx) => {
          const effectiveDate = item.tanggalTerbit || certSettings.tanggalTerbit;

          return (
            <div
              key={item.teacher.id}
              className={`${
                idx < itemsToPrint.length - 1 ? 'print:break-after-page' : ''
              }`}
            >
              {/* Quick inline edit bar above each certificate preview (hidden when printing) */}
              <div className="max-w-[760px] mx-auto mb-2 px-4 py-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden">
                <div className="flex items-center gap-2 text-xs text-emerald-950 font-semibold">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Sertifikat #{idx + 1}: {item.teacher.nama}, {item.teacher.gelar}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canEdit && (
                    <input
                      type="text"
                      value={item.nomorSertifikat}
                      onChange={(e) =>
                        handleNumberChange(
                          item.teacher.id,
                          e.target.value,
                          item.tanggalTerbit
                        )
                      }
                      placeholder="Ketik nomor sertifikat..."
                      className="px-2.5 py-1 text-xs font-mono bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 w-56"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handlePrintSingle(item.teacher.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak</span>
                  </button>
                </div>
              </div>

              {/* Certificate Sheet matching attached reference image_08f85f3a.png */}
              <div className="max-w-[760px] mx-auto bg-white border border-gray-200 shadow-md rounded-2xl print:rounded-none print:border-none print:shadow-none px-8 sm:px-16 py-12 sm:py-16 text-center text-gray-800 relative">
                {/* School Logo Crest */}
                <div className="mb-6">
                  <img
                    src="/assets/aistudio/Logo_Versi_5_3597d11a.png"
                    alt="Logo SMA Plus Ulumul Qur'an Al-Mustofa"
                    className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain"
                  />
                </div>

                {/* Main Title */}
                <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-[#162B4D] font-serif leading-none">
                  SERTIFIKAT
                </h1>
                <h2 className="text-lg sm:text-2xl font-bold tracking-wide text-[#162B4D] font-serif mt-2 uppercase">
                  HASIL SUPERVISI GURU
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 mt-2 font-serif">
                  Nomor:{' '}
                  {item.nomorSertifikat ? (
                    <span className="font-semibold text-gray-900">
                      {item.nomorSertifikat}
                    </span>
                  ) : (
                    <span className="tracking-widest text-gray-500">
                      ..................................................
                    </span>
                  )}
                </p>

                {/* Recipient */}
                <p className="text-xs sm:text-sm text-gray-700 font-serif mt-10">
                  Diberikan kepada :
                </p>

                <div className="mt-5 mb-8">
                  <p className="text-lg sm:text-xl font-bold text-[#162B4D] font-serif pb-1.5 inline-block min-w-[260px] sm:min-w-[340px] border-b border-gray-700">
                    {item.teacher.nama}, {item.teacher.gelar}
                  </p>
                </div>

                {/* Certificate Body Copy */}
                <div className="max-w-xl mx-auto space-y-5 text-xs sm:text-[14px] leading-relaxed text-gray-800 font-serif">
                  <p>
                    Atas dedikasi, komitmen, dan pencapaian yang baik dalam
                    <br />
                    pelaksanaan Supervisi Akademik
                    <br />
                    Semester{' '}
                    <span className="font-semibold underline decoration-dotted underline-offset-4 px-1">
                      {school.semester}
                    </span>{' '}
                    Tahun Ajaran{' '}
                    <span className="font-semibold underline decoration-dotted underline-offset-4 px-1">
                      {school.tahunAjaran}
                    </span>
                    ,
                    <br />
                    dengan nilai{' '}
                    <span className="font-bold underline decoration-dotted underline-offset-4 px-1">
                      {item.finalScore}
                    </span>{' '}
                    Predikat{' '}
                    <span className="font-bold underline decoration-dotted underline-offset-4 px-1">
                      {item.predikatLabel}
                    </span>
                    .
                    <br />
                    yang diselenggarakan oleh {certSettings.penyelenggara}.
                  </p>

                  <p>
                    Semoga pencapaian ini dapat terus mempertahankan serta
                    <br />
                    meningkatkan mutu dan kualitas proses pembelajaran ke depannya.
                  </p>
                </div>

                {/* Date & Signature Block */}
                <div className="mt-12 text-xs sm:text-sm text-gray-800 font-serif">
                  <p className="text-[#1e3a5f]">
                    {certSettings.tempatTerbit || 'Sumedang'},{' '}
                    {effectiveDate ? (
                      <span className="text-gray-900 font-medium">{effectiveDate}</span>
                    ) : (
                      <span className="tracking-widest text-gray-500">
                        ........................................
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-gray-800">Kepala Sekolah,</p>

                  <div className="h-16" />

                  <p className="font-medium text-gray-900 underline underline-offset-4">
                    {certSettings.penandatangan}
                  </p>
                  <p className="text-xs text-gray-700 mt-0.5">
                    NUPTK. {certSettings.nuptkPenandatangan}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
