import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  MessageSquare,
  Sparkles,
  Save,
  CheckCircle2,
  Printer,
  UserCheck,
  Award,
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
  Clock,
} from 'lucide-react';
import {
  Teacher,
  PascaObservasiRecord,
  PascaObservasiQuestion,
  SchoolProfile,
  User,
} from '../types/supervisi';

interface PascaObservasiViewProps {
  teachers: Teacher[];
  pascaRecords: PascaObservasiRecord[];
  onSaveRecord: (record: PascaObservasiRecord) => void;
  school: SchoolProfile;
  currentUser?: User;
  onOpenAiAssistant?: () => void;
}

const PASCA_QUESTIONS_STORAGE_KEY = 'super_guru_pasca_observasi_questions';

const DEFAULT_PASCA_QUESTIONS: PascaObservasiQuestion[] = [
  {
    id: 'pasca-q-refleksi',
    section: 'refleksi_guru',
    pertanyaan:
      'Bagaimana perasaan dan kesan umum Anda selama proses pembelajaran berlangsung?',
    placeholder:
      'Ceritakan refleksi perasaan, ketercapaian tujuan, serta kendala yang dirasakan saat KBM...',
    fieldKey: 'refleksiGuru',
  },
  {
    id: 'pasca-q-tercapai',
    section: 'refleksi_guru',
    pertanyaan: 'Aspek yang Berhasil & Sesuai Ekspektasi Selama Pembelajaran',
    placeholder:
      'Tuliskan hal-hal yang sudah berjalan efektif dan berdampak positif pada murid...',
    fieldKey: 'aspekTercapai',
  },
  {
    id: 'pasca-q-belum',
    section: 'refleksi_guru',
    pertanyaan: 'Aspek yang Dirasa Belum Maksimal / Menjadi Tantangan di Kelas',
    placeholder:
      'Tuliskan tantangan teknis, pengelolaan waktu, atau diferensiasi yang perlu diperkuat...',
    fieldKey: 'aspekBelumTercapai',
  },
  {
    id: 'pasca-q-umpan-balik',
    section: 'umpan_balik_supervisor',
    pertanyaan: 'Catatan Umpan Balik Kualitatif Konstruktif Supervisor',
    placeholder:
      'Tuliskan apresiasi praktik baik serta penguatan pedagogik untuk guru...',
    fieldKey: 'umpanBalikSupervisor',
  },
  {
    id: 'pasca-q-perbaikan',
    section: 'umpan_balik_supervisor',
    pertanyaan: 'Rencana Tindakan Perbaikan Mandiri Guru',
    placeholder:
      'Tuliskan langkah konkret perbaikan pembelajaran pada pertemuan berikutnya...',
    fieldKey: 'rencanaPerbaikan',
  },
  {
    id: 'pasca-q-kesepakatan',
    section: 'umpan_balik_supervisor',
    pertanyaan: 'Kesepakatan Bersama Guru & Supervisor',
    placeholder:
      'Tuliskan komitmen tindak lanjut yang disepakati bersama pasca-observasi...',
    fieldKey: 'kesepakatanBersama',
  },
  {
    id: 'pasca-q-rekomendasi',
    section: 'umpan_balik_supervisor',
    pertanyaan: 'Rekomendasi Tindak Lanjut Sekolah (Bimtek / Coaching / MGMP)',
    placeholder:
      'Tuliskan rekomendasi pengembangan kompetensi guru bersama sekolah...',
    fieldKey: 'rekomendasiTindakLanjut',
  },
];

const createEmptyPascaRecord = (guruId: string): PascaObservasiRecord => ({
  id: `pasca-${guruId}`,
  guruId,
  tanggal: new Date().toISOString().split('T')[0],
  refleksiGuru: '',
  aspekTercapai: '',
  aspekBelumTercapai: '',
  umpanBalikSupervisor: '',
  rencanaPerbaikan: '',
  kesepakatanBersama: '',
  rekomendasiTindakLanjut: '',
  status: 'Draf',
  customAnswers: {},
  submittedByGuru: false,
});

export const PascaObservasiView: React.FC<PascaObservasiViewProps> = ({
  teachers,
  pascaRecords,
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

  useEffect(() => {
    if (isGuru) {
      const targetId = matchedTeacher?.id || currentUser?.id || teachers[0]?.id || '';
      setSelectedGuruId(targetId);
    }
  }, [isGuru, matchedTeacher?.id, currentUser?.id, teachers]);

  const currentTeacher = teachers.find((t) => t.id === selectedGuruId) || teachers[0];

  // Dynamic questions state synced via localStorage between Supervisor & Guru
  const [questions, setQuestions] = useState<PascaObservasiQuestion[]>(() => {
    try {
      const raw = localStorage.getItem(PASCA_QUESTIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PascaObservasiQuestion[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_PASCA_QUESTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PASCA_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
    } catch {
      // ignore storage errors
    }
  }, [questions]);

  const buildFormStateForGuru = (guruId: string): PascaObservasiRecord => {
    const existing = pascaRecords.find((r) => r.guruId === guruId);
    if (existing) {
      return {
        ...existing,
        status: existing.status || 'Draf',
        customAnswers: existing.customAnswers || {},
      };
    }
    return createEmptyPascaRecord(guruId);
  };

  const [formData, setFormData] = useState<PascaObservasiRecord>(() =>
    buildFormStateForGuru(initialGuruId)
  );

  useEffect(() => {
    setFormData(buildFormStateForGuru(selectedGuruId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGuruId, pascaRecords]);

  const [isSaved, setIsSaved] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Question Add / Edit modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PascaObservasiQuestion | null>(null);
  const [questionSection, setQuestionSection] = useState<
    'refleksi_guru' | 'umpan_balik_supervisor'
  >('refleksi_guru');
  const [questionText, setQuestionText] = useState('');
  const [questionPlaceholder, setQuestionPlaceholder] = useState('');

  // Download Menu & Print Preview
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

  const getAnswerValue = (rec: PascaObservasiRecord, q: PascaObservasiQuestion): string => {
    if (q.fieldKey) {
      return rec[q.fieldKey] || '';
    }
    return rec.customAnswers?.[q.id] || '';
  };

  const setAnswerValue = (q: PascaObservasiQuestion, value: string) => {
    if (q.fieldKey) {
      setFormData((prev) => ({
        ...prev,
        [q.fieldKey as keyof PascaObservasiRecord]: value,
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

    let nextRecord: PascaObservasiRecord;
    if (isGuru) {
      nextRecord = {
        ...formData,
        guruId: selectedGuruId,
        id: formData.id || `pasca-${selectedGuruId}`,
        submittedByGuru: true,
        submittedAt: today,
        status: formData.status === 'Disepakati' ? 'Disepakati' : 'Draf',
      };
    } else {
      const nextStatus = overrideStatus || formData.status || 'Disepakati';
      nextRecord = {
        ...formData,
        guruId: selectedGuruId,
        id: formData.id || `pasca-${selectedGuruId}`,
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
        ? 'Refleksi Pasca-Observasi Anda berhasil disimpan dan dikirim ke Supervisor.'
        : nextRecord.status === 'Disepakati'
        ? `Hasil Pasca-Observasi & Refleksi ${currentTeacher?.nama || 'Guru'} berhasil disimpan dan disepakati.`
        : `Draf Pasca-Observasi ${currentTeacher?.nama || 'Guru'} berhasil disimpan.`
    );
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleQuickAgreeRow = (teacher: Teacher, existing?: PascaObservasiRecord) => {
    const today = new Date().toISOString().split('T')[0];
    const baseRecord = existing || createEmptyPascaRecord(teacher.id);
    const updated: PascaObservasiRecord = {
      ...baseRecord,
      guruId: teacher.id,
      id: baseRecord.id || `pasca-${teacher.id}`,
      status: 'Disepakati',
      agreedAt: today,
      kesepakatanBersama:
        baseRecord.kesepakatanBersama ||
        'Hasil refleksi pasca-observasi dan rencana perbaikan telah ditinjau dan disepakati bersama supervisor.',
    };
    onSaveRecord(updated);
    if (selectedGuruId === teacher.id) {
      setFormData(updated);
    }
    showBanner(
      'success',
      `Pasca-Observasi & Refleksi untuk ${teacher.nama}, ${teacher.gelar} berhasil disimpan & disepakati.`
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
  const openAddQuestionModal = (
    defaultSection: 'refleksi_guru' | 'umpan_balik_supervisor' = 'refleksi_guru'
  ) => {
    setEditingQuestion(null);
    setQuestionSection(defaultSection);
    setQuestionText('');
    setQuestionPlaceholder('');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: PascaObservasiQuestion) => {
    setEditingQuestion(q);
    setQuestionSection(q.section);
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
                section: questionSection,
                pertanyaan: questionText.trim(),
                placeholder: questionPlaceholder.trim() || q.placeholder,
              }
            : q
        )
      );
      showBanner('success', `Pertanyaan "${questionText.trim()}" berhasil diperbarui.`);
    } else {
      const newQuestion: PascaObservasiQuestion = {
        id: `pasca-q-custom-${Date.now()}`,
        section: questionSection,
        pertanyaan: questionText.trim(),
        placeholder: questionPlaceholder.trim() || 'Tuliskan jawaban Anda...',
      };
      setQuestions((prev) => [...prev, newQuestion]);
      showBanner('success', `Pertanyaan baru "${questionText.trim()}" berhasil ditambahkan.`);
    }

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (q: PascaObservasiQuestion) => {
    if (questions.length <= 1) {
      showBanner('error', 'Minimal harus terdapat 1 pertanyaan Pasca-Observasi & Refleksi.');
      return;
    }
    setQuestions((prev) => prev.filter((item) => item.id !== q.id));
    showBanner('success', `Pertanyaan "${q.pertanyaan}" dihapus.`);
  };

  const handleResetQuestions = () => {
    setQuestions(DEFAULT_PASCA_QUESTIONS);
    showBanner('success', 'Daftar pertanyaan dikembalikan ke standar awal (7 pertanyaan).');
  };

  // Grouped questions
  const guruReflectionQuestions = questions.filter((q) => q.section === 'refleksi_guru');
  const supervisorCoachingQuestions = questions.filter(
    (q) => q.section === 'umpan_balik_supervisor'
  );

  // Excel Download Handlers
  const handleDownloadTeacherExcel = (teacher?: Teacher, record?: PascaObservasiRecord) => {
    const targetTeacher = teacher || currentTeacher;
    const targetRecord = record || formData;
    const guruLabel = targetTeacher ? `${targetTeacher.nama}, ${targetTeacher.gelar}` : 'Guru';

    const wb = XLSX.utils.book_new();
    const rows: Array<Array<string | number>> = [
      ['LEMBAR PASCA-OBSERVASI, REFLEKSI & DIALOG COACHING'],
      ['Satuan Pendidikan', school.namaSekolah],
      ['Tahun Ajaran / Semester', `${school.tahunAjaran} (${school.semester})`],
      ['Nama Guru', guruLabel],
      ['NIP', targetTeacher?.nip || '-'],
      ['Mata Pelajaran', targetTeacher?.mapel || '-'],
      ['Supervisor', school.kepalaSekolah],
      ['Tanggal Dialog Pasca-Observasi', targetRecord.tanggal || '-'],
      ['Status Kesepakatan', targetRecord.status || 'Draf'],
      [],
      ['No', 'Bagian', 'Pertanyaan / Aspek Refleksi', 'Hasil Isian'],
      ...questions.map((q, idx) => [
        idx + 1,
        q.section === 'refleksi_guru'
          ? 'A. Refleksi Diri Guru'
          : 'B. Umpan Balik & Tindak Lanjut Supervisor',
        q.pertanyaan,
        getAnswerValue(targetRecord, q) || '-',
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 34 }, { wch: 46 }, { wch: 68 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Pasca-Observasi');

    const safeName = (targetTeacher?.nama || 'Guru').replace(/[^a-zA-Z0-9]+/g, '_');
    XLSX.writeFile(wb, `Hasil_Pasca_Observasi_${safeName}.xlsx`);
    setIsUnduhMenuOpen(false);
    showBanner('success', `Hasil Pasca-Observasi "${guruLabel}" berhasil diunduh (.xlsx).`);
  };

  const handleDownloadAllExcel = () => {
    const wb = XLSX.utils.book_new();

    const recapRows = teachers.map((t, idx) => {
      const rec = pascaRecords.find((r) => r.guruId === t.id);
      const rowObj: Record<string, string | number> = {
        No: idx + 1,
        'Nama Guru': `${t.nama}, ${t.gelar}`,
        NIP: t.nip,
        'Mata Pelajaran': t.mapel,
        'Tanggal Dialog': rec?.tanggal || '-',
        Status: rec ? rec.status || 'Draf' : 'Belum Diisi',
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
      { wch: 16 },
      { wch: 16 },
      ...questions.map(() => ({ wch: 44 })),
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Pasca-Observasi');
    XLSX.writeFile(wb, 'Rekap_Hasil_Pasca_Observasi_Refleksi.xlsx');
    setIsUnduhMenuOpen(false);
    showBanner(
      'success',
      'Rekap hasil Pasca-Observasi & Refleksi seluruh guru berhasil diunduh (.xlsx).'
    );
  };

  // Submission rows for Supervisor table
  const submissionRows = teachers.map((t) => {
    const rec = pascaRecords.find((r) => r.guruId === t.id);
    const hasGuruAnswers = rec
      ? guruReflectionQuestions.some((q) => getAnswerValue(rec, q).trim().length > 0)
      : false;
    const hasAnyAnswer = rec
      ? questions.some((q) => getAnswerValue(rec, q).trim().length > 0)
      : false;
    const displayStatus: 'Disepakati' | 'Draf' | 'Belum Diisi' =
      !rec || !hasAnyAnswer
        ? 'Belum Diisi'
        : rec.status === 'Disepakati'
        ? 'Disepakati'
        : 'Draf';
    return { teacher: t, record: rec, displayStatus, hasGuruAnswers, hasAnyAnswer };
  });

  const filteredSubmissionRows = submissionRows.filter(({ teacher, record, displayStatus }) => {
    const matchesStatus = tableStatusFilter === 'ALL' || displayStatus === tableStatusFilter;
    const q = tableSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      teacher.nama.toLowerCase().includes(q) ||
      teacher.mapel.toLowerCase().includes(q) ||
      (record?.refleksiGuru || '').toLowerCase().includes(q) ||
      (record?.aspekTercapai || '').toLowerCase().includes(q) ||
      (record?.umpanBalikSupervisor || '').toLowerCase().includes(q) ||
      (record?.kesepakatanBersama || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filledCount = submissionRows.filter((r) => r.hasGuruAnswers || r.hasAnyAnswer).length;
  const agreedCount = submissionRows.filter((r) => r.displayStatus === 'Disepakati').length;
  const formattedToday = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Formal Printable View
  if (showPrintPreview) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs print:hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Cetak / Unduh Hasil Pasca-Observasi &amp; Refleksi
            </h2>
            <p className="text-xs text-gray-500">
              Format lembar dialog coaching, refleksi guru, dan kesepakatan tindak lanjut lengkap dengan Kop Surat Sekolah.
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
                  {school.alamat}, Kec. {school.kecamatan}, {school.kabupatenKota}, {school.provinsi}{' '}
                  {school.kodePos}
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-extrabold text-xl shrink-0">
                UQ
              </div>
            </div>
          </div>

          <div className="text-center my-5">
            <h2 className="text-base font-extrabold text-gray-950 uppercase underline tracking-wider">
              LEMBAR PASCA-OBSERVASI, REFLEKSI &amp; DIALOG COACHING
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
              <span className="text-gray-600">Tanggal Dialog:</span>{' '}
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
              <strong className="text-emerald-900">{formData.status || 'Draf'}</strong>
            </div>
          </div>

          {/* Q&A Table grouped into A and B */}
          <table className="w-full text-left text-xs border border-gray-400 mb-8">
            <thead className="bg-gray-100 text-gray-900 font-bold uppercase border-b border-gray-400">
              <tr>
                <th className="py-2 px-3 border-r border-gray-400 text-center w-10">No</th>
                <th className="py-2 px-3 border-r border-gray-400 w-64">
                  Pertanyaan / Aspek Refleksi
                </th>
                <th className="py-2 px-3">Hasil Isian &amp; Catatan</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-emerald-50 border-b border-gray-400 font-bold text-emerald-950">
                <td colSpan={3} className="py-1.5 px-3 uppercase">
                  A. Refleksi Diri Pendidik (Diisi Guru)
                </td>
              </tr>
              {guruReflectionQuestions.map((q, idx) => (
                <tr key={q.id} className="border-b border-gray-300">
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
              <tr className="bg-emerald-50 border-y border-gray-400 font-bold text-emerald-950">
                <td colSpan={3} className="py-1.5 px-3 uppercase">
                  B. Umpan Balik, Kesepakatan &amp; Tindak Lanjut Supervisor
                </td>
              </tr>
              {supervisorCoachingQuestions.map((q, idx) => (
                <tr key={q.id} className="border-b border-gray-300">
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
          <h2 className="text-xl font-bold text-gray-900">
            Pasca-Observasi, Refleksi &amp; Dialog Coaching
          </h2>
          <p className="text-xs text-gray-500">
            {isGuru
              ? 'Isi lembar refleksi diri setelah observasi kelas untuk ditinjau, didiskusikan, dan disepakati bersama Supervisor.'
              : 'Kelola pertanyaan pasca-observasi, tinjau hasil refleksi guru, simpan kesepakatan, dan unduh hasil.'}
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
                  Unduh Hasil Pasca-Observasi
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
                        Seluruh refleksi, umpan balik &amp; kesepakatan
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
            title="Cetak Lembar Pasca-Observasi"
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
                Kelola Daftar Pertanyaan Pasca-Observasi &amp; Refleksi ({questions.length} Pertanyaan)
              </h3>
              <p className="text-[11px] text-gray-500">
                Tambah atau ubah pertanyaan refleksi &amp; coaching. Perubahan langsung tampil pada formulir laman Supervisor dan laman Guru.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openAddQuestionModal('refleksi_guru')}
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
                  Hasil Isian Pasca-Observasi &amp; Refleksi dari Laman Guru
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  {filledCount}/{teachers.length} Terisi • {agreedCount} Disepakati
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Menampilkan jawaban refleksi pasca-observasi yang sudah diisi masing-masing user guru untuk ditinjau, disimpan, dan disepakati.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Cari nama guru / refleksi..."
                  className="pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
                />
              </div>

              <select
                aria-label="Filter Status Pasca-Observasi"
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
                  <th className="py-3.5 px-4 min-w-[130px]">TANGGAL DIALOG</th>
                  <th className="py-3.5 px-4 min-w-[270px]">HASIL REFLEKSI DARI LAMAN GURU</th>
                  <th className="py-3.5 px-4 min-w-[220px]">UMPAN BALIK &amp; KESEPAKATAN</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">STATUS</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissionRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 px-4 text-center text-gray-500">
                      <p className="text-sm font-semibold text-gray-700">
                        Tidak ada data Pasca-Observasi &amp; Refleksi yang sesuai filter
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissionRows.map(
                    ({ teacher, record, displayStatus, hasAnyAnswer }, idx) => {
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

                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="font-semibold text-gray-800">
                              {record?.tanggal || '-'}
                            </div>
                            {record?.submittedAt && (
                              <div className="text-[10px] text-emerald-700 mt-0.5">
                                Dikirim: {record.submittedAt}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            {!hasAnyAnswer || !record ? (
                              <span className="text-gray-400 italic">
                                Belum ada isian refleksi dari user guru ini.
                              </span>
                            ) : (
                              <div className="space-y-1">
                                {guruReflectionQuestions.slice(0, 3).map((q, qIdx) => {
                                  const ans = getAnswerValue(record, q);
                                  if (!ans) return null;
                                  return (
                                    <div key={q.id} className="text-[11px] leading-snug">
                                      <span className="font-bold text-emerald-900">
                                        R{qIdx + 1}:
                                      </span>{' '}
                                      <span className="text-gray-700 line-clamp-1 inline">
                                        {ans}
                                      </span>
                                    </div>
                                  );
                                })}
                                {guruReflectionQuestions.length > 3 && (
                                  <div className="text-[10px] text-gray-400">
                                    +{guruReflectionQuestions.length - 3} pertanyaan refleksi lainnya
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                              {record?.kesepakatanBersama || record?.umpanBalikSupervisor || '-'}
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
                                title="Tinjau & Edit Detail Refleksi Guru"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Tinjau</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickAgreeRow(teacher, record)}
                                title="Simpan & Sepakati Hasil Pasca-Observasi"
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
                                    record || createEmptyPascaRecord(teacher.id)
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
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Target Teacher Card */}
      {currentTeacher && (
        <div className="bg-gradient-to-r from-[#033c2a] via-[#064e3b] to-[#043b2c] p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                Dialog Reflektif &amp; Coaching
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
            <Award className="w-5 h-5 text-yellow-300" />
            <div className="text-xs">
              <span className="font-bold text-white block">Status Kesepakatan:</span>
              <span className="text-emerald-200 font-semibold">
                {formData.status || 'Draf'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form
        ref={formSectionRef}
        onSubmit={(e) => handleSave(e)}
        className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="w-full md:w-64">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tanggal Dialog Pasca-Observasi
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) => {
                setFormData({ ...formData, tanggal: e.target.value });
                setIsSaved(false);
              }}
              className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-gray-700">Status:</span>
                <select
                  value={formData.status || 'Draf'}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Draf' | 'Disepakati',
                    });
                    setIsSaved(false);
                  }}
                  className="text-xs font-bold px-2.5 py-1.5 border border-emerald-300 bg-emerald-50/50 rounded-lg text-emerald-900 focus:outline-none cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Gunakan AI Coaching Prompts</span>
              </button>
            )}
          </div>
        </div>

        {/* Section A: Teacher's Self-Reflection Questions */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>A. Refleksi Diri Pendidik (Guru yang Disupervisi)</span>
            </h3>
            {canManage && (
              <button
                type="button"
                onClick={() => openAddQuestionModal('refleksi_guru')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Pertanyaan Refleksi</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {guruReflectionQuestions.map((q, idx) => (
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
                  placeholder={q.placeholder || 'Tuliskan refleksi Anda...'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Supervisor Feedback, Agreement & Follow-up */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>B. Umpan Balik, Kesepakatan &amp; Tindak Lanjut Supervisor</span>
            </h3>
            {canManage && (
              <button
                type="button"
                onClick={() => openAddQuestionModal('umpan_balik_supervisor')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Pertanyaan Coaching</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {supervisorCoachingQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-emerald-200/70 bg-emerald-50/25"
              >
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
                  readOnly={isGuru}
                  value={getAnswerValue(formData, q)}
                  onChange={(e) => setAnswerValue(q, e.target.value)}
                  className={`w-full text-xs p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    isGuru ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'bg-white'
                  }`}
                  placeholder={
                    isGuru
                      ? 'Bagian ini diisi oleh Supervisor setelah peninjauan refleksi Anda.'
                      : q.placeholder || 'Tuliskan umpan balik / kesepakatan...'
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Lembar Pasca-Observasi &amp; Refleksi berhasil disimpan!
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
                  <span>Simpan &amp; Sepakati Pasca-Observasi</span>
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan &amp; Kirim Refleksi Pasca-Observasi</span>
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Modal: Add / Edit Pertanyaan Pasca-Observasi */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-200 overflow-hidden">
            <div className="bg-[#064e3b] px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {editingQuestion
                    ? 'Edit Pertanyaan Pasca-Observasi & Refleksi'
                    : 'Tambah Pertanyaan Pasca-Observasi & Refleksi'}
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
                  Bagian / Kategori Pertanyaan *
                </label>
                <select
                  value={questionSection}
                  onChange={(e) =>
                    setQuestionSection(
                      e.target.value as 'refleksi_guru' | 'umpan_balik_supervisor'
                    )
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-semibold text-gray-800"
                >
                  <option value="refleksi_guru">
                    A. Refleksi Diri Pendidik (Diisi Guru)
                  </option>
                  <option value="umpan_balik_supervisor">
                    B. Umpan Balik &amp; Tindak Lanjut (Diisi Supervisor)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Teks Pertanyaan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Contoh: Apa strategi penguatan karakter murid yang akan Anda pertahankan di pertemuan berikutnya?"
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
                  placeholder="Contoh: Tuliskan rencana konkret atau contoh praktik baik..."
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
