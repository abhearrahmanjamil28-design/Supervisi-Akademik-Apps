import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  CheckCircle2,
  Save,
  Sparkles,
  Clock,
  Printer,
  Plus,
  Pencil,
  Trash2,
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  X,
  RotateCcw,
  Search,
  Check,
  Eye,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  Teacher,
  PraObservasiRecord,
  PraObservasiQuestion,
  SchoolProfile,
  User,
} from '../types/supervisi';

interface PraObservasiViewProps {
  teachers: Teacher[];
  praRecords: PraObservasiRecord[];
  onSaveRecord: (record: PraObservasiRecord) => void;
  school: SchoolProfile;
  currentUser?: User;
  onOpenAiAssistant?: () => void;
}

const PRA_QUESTIONS_STORAGE_KEY = 'super_guru_pra_observasi_questions';

const DEFAULT_PRA_QUESTIONS: PraObservasiQuestion[] = [
  {
    id: 'q-tujuan',
    pertanyaan: 'Tujuan Pembelajaran yang Ingin Dicapai',
    placeholder: 'Tuliskan tujuan pembelajaran spesifik dan terukur...',
    fieldKey: 'tujuanPembelajaran',
  },
  {
    id: 'q-fokus',
    pertanyaan: 'Area Fokus / Bagian Kompetensi Guru yang Ingin Ditingkatkan',
    placeholder: 'Contoh: Manajemen waktu diskusi, diferensiasi konten & proses...',
    fieldKey: 'areaFokusPengembangan',
  },
  {
    id: 'q-strategi',
    pertanyaan: 'Strategi & Model Pembelajaran yang Digunakan',
    placeholder: 'Contoh: Model Problem Based Learning dengan LKPD interaktif...',
    fieldKey: 'strategiPembelajaran',
  },
  {
    id: 'q-media',
    pertanyaan: 'Media, Sarana & Alat Bantu Pembelajaran',
    placeholder: 'Contoh: LCD Proyektor, PhET Simulation, LKPD Cetak...',
    fieldKey: 'mediaAlatBantu',
  },
];

const createEmptyPraRecord = (guruId: string): PraObservasiRecord => ({
  id: `pra-${guruId}`,
  guruId,
  tanggal: new Date().toISOString().split('T')[0],
  tujuanPembelajaran: '',
  areaFokusPengembangan: '',
  strategiPembelajaran: '',
  mediaAlatBantu: '',
  kesepakatanFokus: [],
  waktuPelaksanaan: '',
  catatanSupervisor: '',
  status: 'Draf',
  customAnswers: {},
  submittedByGuru: false,
});

export const PraObservasiView: React.FC<PraObservasiViewProps> = ({
  teachers,
  praRecords,
  onSaveRecord,
  school,
  currentUser,
  onOpenAiAssistant,
}) => {
  const isGuru = currentUser?.role === 'guru';
  const canManage = !isGuru; // Supervisor & Admin

  const matchedTeacher = isGuru
    ? teachers.find(
        (t) =>
          t.id === currentUser?.id ||
          (currentUser?.nip && t.nip === currentUser.nip) ||
          (currentUser?.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (t.username &&
            currentUser?.email &&
            t.username.toLowerCase() === currentUser.email.toLowerCase())
      )
    : undefined;

  const initialGuruId = isGuru
    ? matchedTeacher?.id || currentUser?.id || teachers[0]?.id || ''
    : teachers[0]?.id || '';

  const [selectedGuruId, setSelectedGuruId] = useState<string>(initialGuruId);

  // Sync selectedGuruId if role switches to guru
  useEffect(() => {
    if (isGuru) {
      const targetId = matchedTeacher?.id || currentUser?.id || teachers[0]?.id || '';
      setSelectedGuruId(targetId);
    }
  }, [isGuru, matchedTeacher?.id, currentUser?.id, teachers]);

  const currentTeacher = teachers.find((t) => t.id === selectedGuruId) || teachers[0];

  // Dynamic questions state (persisted in localStorage so Supervisor edits appear on Guru view)
  const [questions, setQuestions] = useState<PraObservasiQuestion[]>(() => {
    try {
      const raw = localStorage.getItem(PRA_QUESTIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PraObservasiQuestion[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_PRA_QUESTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PRA_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
    } catch {
      // ignore storage errors
    }
  }, [questions]);

  const buildFormStateForGuru = (guruId: string): PraObservasiRecord => {
    const existing = praRecords.find((r) => r.guruId === guruId);
    if (existing) {
      return {
        ...existing,
        customAnswers: existing.customAnswers || {},
      };
    }
    return createEmptyPraRecord(guruId);
  };

  const [formData, setFormData] = useState<PraObservasiRecord>(() =>
    buildFormStateForGuru(initialGuruId)
  );

  // Keep form synced when selectedGuruId or praRecords updates
  useEffect(() => {
    setFormData(buildFormStateForGuru(selectedGuruId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuruId, praRecords]);

  const [isSaved, setIsSaved] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Question Add / Edit Modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PraObservasiQuestion | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionPlaceholder, setQuestionPlaceholder] = useState('');

  // Download Menu & Print Preview state
  const [isUnduhMenuOpen, setIsUnduhMenuOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const unduhDropdownRef = useRef<HTMLDivElement | null>(null);
  const formSectionRef = useRef<HTMLFormElement | null>(null);

  // Guru Submissions Table Filters
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<
    'ALL' | 'Disepakati' | 'Draf' | 'Belum Diisi'
  >('ALL');

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        unduhDropdownRef.current &&
        !unduhDropdownRef.current.contains(event.target as Node)
      ) {
        setIsUnduhMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setStatusBanner({ type, message });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const getAnswerValue = (rec: PraObservasiRecord, q: PraObservasiQuestion): string => {
    if (q.fieldKey) {
      return rec[q.fieldKey] || '';
    }
    return rec.customAnswers?.[q.id] || '';
  };

  const setAnswerValue = (q: PraObservasiQuestion, value: string) => {
    if (q.fieldKey) {
      setFormData((prev) => ({
        ...prev,
        [q.fieldKey as keyof PraObservasiRecord]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customAnswers: {
          ...(prev.customAnswers || {}),
          [q.id]: value,
        },
      }));
    }
    setIsSaved(false);
  };

  const handleTeacherChange = (id: string) => {
    setSelectedGuruId(id);
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent, overrideStatus?: 'Draf' | 'Disepakati') => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    let nextRecord: PraObservasiRecord;
    if (isGuru) {
      nextRecord = {
        ...formData,
        guruId: selectedGuruId,
        id: formData.id || `pra-${selectedGuruId}`,
        submittedByGuru: true,
        submittedAt: today,
        status: formData.status === 'Disepakati' ? 'Disepakati' : 'Draf',
      };
    } else {
      const nextStatus = overrideStatus || formData.status || 'Disepakati';
      nextRecord = {
        ...formData,
        guruId: selectedGuruId,
        id: formData.id || `pra-${selectedGuruId}`,
        status: nextStatus,
        agreedAt: nextStatus === 'Disepakati' ? today : formData.agreedAt,
      };
    }

    onSaveRecord(nextRecord);
    setFormData(nextRecord);
    setIsSaved(true);
    showBanner(
      'success',
      isGuru
        ? 'Isian Pra-Observasi Anda berhasil disimpan dan dikirim ke Supervisor.'
        : nextRecord.status === 'Disepakati'
        ? `Hasil Pra-Observasi ${currentTeacher?.nama || 'Guru'} berhasil disimpan dan disepakati.`
        : `Draf Pra-Observasi ${currentTeacher?.nama || 'Guru'} berhasil disimpan.`
    );
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleQuickAgreeRow = (teacher: Teacher, existing?: PraObservasiRecord) => {
    const today = new Date().toISOString().split('T')[0];
    const baseRecord = existing || createEmptyPraRecord(teacher.id);
    const updated: PraObservasiRecord = {
      ...baseRecord,
      guruId: teacher.id,
      id: baseRecord.id || `pra-${teacher.id}`,
      status: 'Disepakati',
      agreedAt: today,
      catatanSupervisor:
        baseRecord.catatanSupervisor ||
        'Hasil isian pra-observasi telah ditinjau dan disepakati bersama supervisor.',
    };
    onSaveRecord(updated);
    if (selectedGuruId === teacher.id) {
      setFormData(updated);
    }
    showBanner(
      'success',
      `Pra-Observasi untuk ${teacher.nama}, ${teacher.gelar} berhasil disimpan & disepakati.`
    );
  };

  const handleReviewTeacherRow = (teacherId: string) => {
    setSelectedGuruId(teacherId);
    setIsSaved(false);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  // Question CRUD Handlers (Supervisor)
  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setQuestionPlaceholder('');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: PraObservasiQuestion) => {
    setEditingQuestion(q);
    setQuestionText(q.pertanyaan);
    setQuestionPlaceholder(q.placeholder || '');
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    if (editingQuestion) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
                ...q,
                pertanyaan: questionText.trim(),
                placeholder: questionPlaceholder.trim() || q.placeholder,
              }
            : q
        )
      );
      showBanner('success', `Pertanyaan "${questionText.trim()}" berhasil diperbarui.`);
    } else {
      const newQuestion: PraObservasiQuestion = {
        id: `q-custom-${Date.now()}`,
        pertanyaan: questionText.trim(),
        placeholder: questionPlaceholder.trim() || 'Tuliskan jawaban Anda...',
      };
      setQuestions((prev) => [...prev, newQuestion]);
      showBanner('success', `Pertanyaan baru "${questionText.trim()}" berhasil ditambahkan.`);
    }

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (q: PraObservasiQuestion) => {
    if (questions.length <= 1) {
      showBanner('error', 'Minimal harus terdapat 1 pertanyaan Pra-Observasi.');
      return;
    }
    setQuestions((prev) => prev.filter((item) => item.id !== q.id));
    showBanner('success', `Pertanyaan "${q.pertanyaan}" dihapus.`);
  };

  const handleResetQuestions = () => {
    setQuestions(DEFAULT_PRA_QUESTIONS);
    showBanner('success', 'Daftar pertanyaan dikembalikan ke standar awal (4 pertanyaan).');
  };

  // Excel Download Handlers
  const handleDownloadTeacherExcel = (teacher?: Teacher, record?: PraObservasiRecord) => {
    const targetTeacher = teacher || currentTeacher;
    const targetRecord = record || formData;
    const guruLabel = targetTeacher
      ? `${targetTeacher.nama}, ${targetTeacher.gelar}`
      : 'Guru';

    const wb = XLSX.utils.book_new();
    const rows: Array<Array<string | number>> = [
      ['LEMBAR HASIL WAWANCARA PRA-OBSERVASI'],
      ['Satuan Pendidikan', school.namaSekolah],
      ['Tahun Ajaran / Semester', `${school.tahunAjaran} (${school.semester})`],
      ['Nama Guru', guruLabel],
      ['NIP', targetTeacher?.nip || '-'],
      ['Mata Pelajaran', targetTeacher?.mapel || '-'],
      ['Supervisor', school.kepalaSekolah],
      ['Tanggal Wawancara', targetRecord.tanggal || '-'],
      ['Rencana Waktu & Tempat KBM', targetRecord.waktuPelaksanaan || '-'],
      ['Status Kesepakatan', targetRecord.status],
      ['Catatan Kesepakatan Supervisor', targetRecord.catatanSupervisor || '-'],
      [],
      ['No', 'Pertanyaan Pra-Observasi', 'Hasil Isian Guru'],
      ...questions.map((q, idx) => [
        idx + 1,
        q.pertanyaan,
        getAnswerValue(targetRecord, q) || '-',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 46 }, { wch: 68 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Pra-Observasi');

    const safeName = (targetTeacher?.nama || 'Guru').replace(/[^a-zA-Z0-9]+/g, '_');
    XLSX.writeFile(wb, `Hasil_Pra_Observasi_${safeName}.xlsx`);
    setIsUnduhMenuOpen(false);
    showBanner('success', `Hasil Pra-Observasi "${guruLabel}" berhasil diunduh (.xlsx).`);
  };

  const handleDownloadAllExcel = () => {
    const wb = XLSX.utils.book_new();

    const recapRows = teachers.map((t, idx) => {
      const rec = praRecords.find((r) => r.guruId === t.id);
      const rowObj: Record<string, string | number> = {
        No: idx + 1,
        'Nama Guru': `${t.nama}, ${t.gelar}`,
        NIP: t.nip,
        'Mata Pelajaran': t.mapel,
        'Tanggal Pra-Observasi': rec?.tanggal || '-',
        'Rencana Waktu & Tempat KBM': rec?.waktuPelaksanaan || '-',
        Status: rec ? rec.status : 'Belum Diisi',
        'Catatan Supervisor': rec?.catatanSupervisor || '-',
      };
      questions.forEach((q, qIdx) => {
        rowObj[`P${qIdx + 1}: ${q.pertanyaan}`] = rec ? getAnswerValue(rec, q) || '-' : '-';
      });
      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(recapRows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 30 },
      { wch: 16 },
      { wch: 36 },
      ...questions.map(() => ({ wch: 42 })),
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Pra-Observasi');
    XLSX.writeFile(wb, 'Rekap_Hasil_Pra_Observasi_Guru.xlsx');
    setIsUnduhMenuOpen(false);
    showBanner('success', 'Rekap hasil Pra-Observasi seluruh guru berhasil diunduh (.xlsx).');
  };

  // Compute submission rows for Supervisor table
  const submissionRows = teachers.map((t) => {
    const rec = praRecords.find((r) => r.guruId === t.id);
    const hasAnyAnswer = rec
      ? questions.some((q) => getAnswerValue(rec, q).trim().length > 0) ||
        Boolean(rec.waktuPelaksanaan?.trim())
      : false;
    const displayStatus: 'Disepakati' | 'Draf' | 'Belum Diisi' = !rec || !hasAnyAnswer
      ? 'Belum Diisi'
      : rec.status === 'Disepakati'
      ? 'Disepakati'
      : 'Draf';
    return { teacher: t, record: rec, displayStatus, hasAnyAnswer };
  });

  const filteredSubmissionRows = submissionRows.filter(({ teacher, record, displayStatus }) => {
    const matchesStatus =
      tableStatusFilter === 'ALL' || displayStatus === tableStatusFilter;
    const q = tableSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      teacher.nama.toLowerCase().includes(q) ||
      teacher.mapel.toLowerCase().includes(q) ||
      (record?.tujuanPembelajaran || '').toLowerCase().includes(q) ||
      (record?.strategiPembelajaran || '').toLowerCase().includes(q) ||
      (record?.catatanSupervisor || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filledCount = submissionRows.filter((r) => r.hasAnyAnswer).length;
  const agreedCount = submissionRows.filter((r) => r.displayStatus === 'Disepakati').length;
  const formattedToday = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Printable Formal View ("Unduh / Cetak Hasil Pra-Observasi")
  if (showPrintPreview) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs print:hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Cetak / Unduh Hasil Pra-Observasi
            </h2>
            <p className="text-xs text-gray-500">
              Format lembar wawancara dan kesepakatan pra-observasi siap cetak lengkap dengan Kop Surat Sekolah.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isGuru && (
              <select
                value={selectedGuruId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="text-xs font-semibold p-2 border border-emerald-300 bg-emerald-50/50 rounded-xl text-emerald-950 focus:outline-none"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}, {t.gelar} ({t.mapel})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setShowPrintPreview(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-lg max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-gray-900">
          {/* Kop Surat */}
          <div className="border-b-4 border-double border-emerald-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c593d] to-[#04281c] border-2 border-emerald-500 flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="text-center flex-1">
                <h3 className="text-[11px] font-bold tracking-widest text-emerald-900 uppercase">
                  YAYASAN PENDIDIKAN ISLAM AL-MUSTOFA
                </h3>
                <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase mt-0.5">
                  {school.namaSekolah}
                </h1>
                <p className="text-[11px] font-semibold text-emerald-800 tracking-wide mt-0.5">
                  TERAKREDITASI {school.akreditasi} • NPSN: {school.npsn} • NSS: {school.nss}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {school.alamat}, Kec. {school.kecamatan}, {school.kabupatenKota}, {school.provinsi} {school.kodePos}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-extrabold text-xl shrink-0">
                UQ
              </div>
            </div>
          </div>

          <div className="text-center my-5">
            <h2 className="text-base font-extrabold text-gray-950 uppercase underline tracking-wider">
              LEMBAR WAWANCARA &amp; KESEPAKATAN PRA-OBSERVASI
            </h2>
            <p className="text-xs text-emerald-900 font-semibold mt-1">
              Tahun Ajaran {school.tahunAjaran} — Semester {school.semester}
            </p>
          </div>

          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-gray-300 bg-gray-50/50 mb-5 text-xs">
            <div>
              <span className="text-gray-600">Nama Guru:</span>{' '}
              <strong className="text-gray-900">
                {currentTeacher ? `${currentTeacher.nama}, ${currentTeacher.gelar}` : '-'}
              </strong>
            </div>
            <div>
              <span className="text-gray-600">Tanggal Wawancara:</span>{' '}
              <strong className="text-gray-900">{formData.tanggal || '-'}</strong>
            </div>
            <div>
              <span className="text-gray-600">NIP:</span>{' '}
              <strong className="text-gray-900">{currentTeacher?.nip || '-'}</strong>
            </div>
            <div>
              <span className="text-gray-600">Mata Pelajaran:</span>{' '}
              <strong className="text-gray-900">{currentTeacher?.mapel || '-'}</strong>
            </div>
            <div>
              <span className="text-gray-600">Supervisor:</span>{' '}
              <strong className="text-gray-900">{school.kepalaSekolah}</strong>
            </div>
            <div>
              <span className="text-gray-600">Status Kesepakatan:</span>{' '}
              <strong className="text-emerald-900">{formData.status}</strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-600">Rencana Waktu &amp; Tempat KBM:</span>{' '}
              <strong className="text-gray-900">{formData.waktuPelaksanaan || '-'}</strong>
            </div>
          </div>

          {/* Q&A Table */}
          <table className="w-full text-left text-xs border border-gray-400 mb-5">
            <thead className="bg-gray-100 text-gray-900 font-bold uppercase border-b border-gray-400">
              <tr>
                <th className="py-2 px-3 border-r border-gray-400 text-center w-10">No</th>
                <th className="py-2 px-3 border-r border-gray-400 w-64">Pertanyaan Pra-Observasi</th>
                <th className="py-2 px-3">Jawaban / Isian Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td className="py-2.5 px-3 border-r border-gray-300 text-center font-semibold align-top">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 border-r border-gray-300 font-bold text-gray-900 align-top">
                    {q.pertanyaan}
                  </td>
                  <td className="py-2.5 px-3 text-gray-800 leading-relaxed whitespace-pre-line">
                    {getAnswerValue(formData, q) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-8 p-4 rounded-xl border border-gray-300 bg-gray-50/40 text-xs">
            <h4 className="font-bold text-gray-900 mb-1">
              Catatan Kesepakatan Supervisor &amp; Guru:
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {formData.catatanSupervisor || '-'}
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-2 text-xs text-center">
            <div className="space-y-16">
              <div>
                <p className="text-gray-700">Guru yang Disupervisi,</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 underline">
                  {currentTeacher ? `${currentTeacher.nama}, ${currentTeacher.gelar}` : '....................'}
                </p>
                <p className="text-[11px] text-gray-600">NIP. {currentTeacher?.nip || '-'}</p>
              </div>
            </div>
            <div className="space-y-16">
              <div>
                <p className="text-gray-700">
                  {school.kabupatenKota}, {formattedToday}
                </p>
                <p className="font-bold text-gray-900">Supervisor / Kepala Sekolah</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 underline">{school.kepalaSekolah}</p>
                <p className="text-[11px] text-gray-600">NIP. {school.nipKepalaSekolah}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lembar Wawancara Pra-Observasi</h2>
          <p className="text-xs text-gray-500">
            {isGuru
              ? 'Isi lembar persiapan dan pertanyaan pra-observasi untuk ditinjau dan disepakati bersama Supervisor.'
              : 'Kelola pertanyaan pra-observasi, tinjau hasil isian guru, simpan kesepakatan, dan unduh hasil.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canManage && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">Pilih Guru:</span>
              <select
                value={selectedGuruId}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="text-xs font-semibold p-2 border border-emerald-300 bg-emerald-50/50 rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}, {t.gelar} ({t.mapel})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Unduh Hasil Dropdown */}
          <div className="relative" ref={unduhDropdownRef}>
            <button
              type="button"
              onClick={() => setIsUnduhMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Hasil</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isUnduhMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUnduhMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-30 text-xs">
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Unduh Hasil Pra-Observasi
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadTeacherExcel()}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900">
                      Unduh Hasil Guru Terpilih (.xlsx)
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {currentTeacher ? `${currentTeacher.nama}, ${currentTeacher.gelar}` : 'Excel'}
                    </div>
                  </div>
                </button>
                {canManage && (
                  <button
                    type="button"
                    onClick={handleDownloadAllExcel}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">
                        Unduh Rekap Semua Guru (.xlsx)
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Seluruh hasil isian &amp; status kesepakatan
                      </div>
                    </div>
                  </button>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsUnduhMenuOpen(false);
                    setShowPrintPreview(true);
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-gray-50 flex items-start gap-2.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 text-gray-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-gray-900">Cetak / Simpan PDF</div>
                    <div className="text-[10px] text-gray-500">
                      Format resmi lengkap dengan Kop Surat
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowPrintPreview(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
            title="Cetak Lembar Pra-Observasi"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* Supervisor Question Management Toolbar */}
      {canManage && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">
                Kelola Daftar Pertanyaan Pra-Observasi ({questions.length} Pertanyaan)
              </h3>
              <p className="text-[11px] text-gray-500">
                Tambah atau ubah pertanyaan wawancara. Perubahan pertanyaan langsung tampil pada formulir isian laman Guru.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddQuestionModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pertanyaan</span>
            </button>

            <button
              type="button"
              onClick={handleResetQuestions}
              title="Kembalikan pertanyaan ke standar awal"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Standar</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Notification Banner */}
      {statusBanner && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-semibold ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="p-0.5 hover:opacity-70 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Supervisor Table: Hasil Isian dari Laman Guru Sesuai Usernya */}
      {canManage && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  Hasil Isian Pra-Observasi dari Laman Guru
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {filledCount}/{teachers.length} Terisi • {agreedCount} Disepakati
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Menampilkan jawaban pra-observasi yang sudah diisi masing-masing user guru untuk ditinjau, disimpan, dan disepakati.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Cari nama guru / isian..."
                  className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>

              <select
                aria-label="Filter Status Pra-Observasi"
                value={tableStatusFilter}
                onChange={(e) =>
                  setTableStatusFilter(
                    e.target.value as 'ALL' | 'Disepakati' | 'Draf' | 'Belum Diisi'
                  )
                }
                className="text-xs font-semibold px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Status ({teachers.length})</option>
                <option value="Disepakati">Disepakati</option>
                <option value="Draf">Menunggu Kesepakatan (Draf)</option>
                <option value="Belum Diisi">Belum Diisi</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#064e3b] text-white uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">NO</th>
                  <th className="py-3.5 px-4 min-w-[180px]">USER GURU &amp; MAPEL</th>
                  <th className="py-3.5 px-4 min-w-[160px]">TANGGAL &amp; WAKTU KBM</th>
                  <th className="py-3.5 px-4 min-w-[280px]">HASIL ISIAN DARI LAMAN GURU</th>
                  <th className="py-3.5 px-4 min-w-[180px]">CATATAN SUPERVISOR</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">STATUS</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissionRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 px-4 text-center text-gray-500">
                      <p className="text-sm font-semibold text-gray-700">
                        Tidak ada data Pra-Observasi yang sesuai filter
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissionRows.map(({ teacher, record, displayStatus, hasAnyAnswer }, idx) => {
                    const isSelectedRow = selectedGuruId === teacher.id;
                    return (
                      <tr
                        key={teacher.id}
                        className={`transition-colors ${
                          isSelectedRow ? 'bg-emerald-50/50' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center font-bold text-gray-500 align-top">
                          {idx + 1}
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-gray-900">
                            {teacher.nama}, {teacher.gelar}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {teacher.mapel} • {teacher.username || teacher.email}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-gray-800">
                            {record?.tanggal || '-'}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {record?.waktuPelaksanaan || 'Belum diisi'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          {!hasAnyAnswer || !record ? (
                            <span className="text-gray-400 italic">
                              Belum ada isian dari user guru ini.
                            </span>
                          ) : (
                            <div className="space-y-1">
                              {questions.slice(0, 3).map((q, qIdx) => {
                                const ans = getAnswerValue(record, q);
                                if (!ans) return null;
                                return (
                                  <div key={q.id} className="text-[11px] leading-snug">
                                    <span className="font-bold text-emerald-900">
                                      P{qIdx + 1}:
                                    </span>{' '}
                                    <span className="text-gray-700 line-clamp-1 inline">
                                      {ans}
                                    </span>
                                  </div>
                                );
                              })}
                              {questions.length > 3 && (
                                <div className="text-[10px] text-gray-400">
                                  +{questions.length - 3} pertanyaan lainnya (klik Tinjau untuk detail)
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                            {record?.catatanSupervisor || '-'}
                          </p>
                        </td>

                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              displayStatus === 'Disepakati'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : displayStatus === 'Draf'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {displayStatus === 'Disepakati' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{displayStatus}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleReviewTeacherRow(teacher.id)}
                              title="Tinjau & Edit Detail Isian Guru"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Tinjau</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickAgreeRow(teacher, record)}
                              title="Simpan & Sepakati Hasil Pra-Observasi"
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                displayStatus === 'Disepakati'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                {displayStatus === 'Disepakati' ? 'Disepakati' : 'Simpan & Sepakati'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadTeacherExcel(
                                  teacher,
                                  record || createEmptyPraRecord(teacher.id)
                                )
                              }
                              title="Unduh Hasil Guru Ini (.xlsx)"
                              className="p-1.5 border border-gray-200 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hero Banner with Teacher Bio */}
      {currentTeacher && (
        <div className="bg-gradient-to-r from-[#033c2a] via-[#064e3b] to-[#043b2c] p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                Pra-Observasi Kelas
              </span>
              <span className="text-xs text-emerald-200">{currentTeacher.mapel}</span>
            </div>
            <h3 className="text-xl font-black mt-1 text-white">
              {currentTeacher.nama}, {currentTeacher.gelar}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Supervisor: <span className="font-semibold text-white">{school.kepalaSekolah}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <div className="text-xs">
              <span className="font-bold text-white block">Status Kesepakatan:</span>
              <span className="text-emerald-200 font-semibold">{formData.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Form Content (Guru fills answers; Supervisor reviews, edits questions, adds notes, & agrees) */}
      <form
        ref={formSectionRef}
        onSubmit={(e) => handleSave(e)}
        className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Tanggal Wawancara Pra-Observasi
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Rencana Waktu &amp; Tempat KBM Dilaksanakan
            </label>
            <input
              type="text"
              value={formData.waktuPelaksanaan}
              onChange={(e) =>
                setFormData({ ...formData, waktuPelaksanaan: e.target.value })
              }
              placeholder="Contoh: Selasa, Jam ke 3-4 (Kelas XI MIPA 1)"
              className="w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Dynamic Questions List */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <label className="block text-xs font-bold text-gray-800 leading-snug">
                  {idx + 1}. {q.pertanyaan}
                </label>

                {canManage && (
                  <div className="inline-flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditQuestionModal(q)}
                      title="Edit Pertanyaan"
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q)}
                      title="Hapus Pertanyaan"
                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <textarea
                rows={2}
                value={getAnswerValue(formData, q)}
                onChange={(e) => setAnswerValue(q, e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder={q.placeholder || 'Tuliskan jawaban Anda...'}
              />
            </div>
          ))}
        </div>

        {/* Supervisor Agreement Notes & Status */}
        <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-gray-800">
              Catatan Kesepakatan Supervisor &amp; Guru:
            </label>
            <div className="flex items-center gap-3">
              {canManage && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Draf' | 'Disepakati',
                      })
                    }
                    className="text-xs font-bold px-2.5 py-1 border border-emerald-300 bg-white rounded-lg text-emerald-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Draf">Draf</option>
                    <option value="Disepakati">Disepakati</option>
                  </select>
                </div>
              )}

              {onOpenAiAssistant && canManage && (
                <button
                  type="button"
                  onClick={onOpenAiAssistant}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                  <span>Bantuan AI</span>
                </button>
              )}
            </div>
          </div>

          <textarea
            rows={2}
            readOnly={isGuru}
            value={formData.catatanSupervisor}
            onChange={(e) => setFormData({ ...formData, catatanSupervisor: e.target.value })}
            placeholder={
              isGuru
                ? 'Catatan kesepakatan akan diisi oleh Supervisor setelah peninjauan.'
                : 'Tuliskan catatan kesepakatan hasil pra-observasi...'
            }
            className={`w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
              isGuru ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Lembar Pra-Observasi berhasil disimpan!
            </span>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {canManage ? (
              <>
                <button
                  type="button"
                  onClick={(e) => handleSave(e, 'Draf')}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Simpan Draf
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSave(e, 'Disepakati')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan &amp; Sepakati Pra-Observasi</span>
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan &amp; Kirim Isian Pra-Observasi</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Modal: Add / Edit Pertanyaan Pra-Observasi */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingQuestion
                    ? 'Edit Pertanyaan Pra-Observasi'
                    : 'Tambah Pertanyaan Pra-Observasi'}
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Pertanyaan akan tampil otomatis pada laman Supervisor dan laman Guru
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 text-emerald-100 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Teks Pertanyaan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Contoh: Bagaimana rencana asesmen formatif yang akan diterapkan di akhir KBM?"
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Petunjuk / Placeholder Jawaban (Opsional)
                </label>
                <input
                  type="text"
                  value={questionPlaceholder}
                  onChange={(e) => setQuestionPlaceholder(e.target.value)}
                  placeholder="Contoh: Jelaskan bentuk asesmen dan rubrik singkat..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064e3b] hover:bg-[#033c2a] text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingQuestion ? 'Simpan Perubahan' : 'Tambahkan Pertanyaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
