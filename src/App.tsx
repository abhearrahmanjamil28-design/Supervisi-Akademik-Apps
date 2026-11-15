import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { AiAssistantModal } from './components/AiAssistantModal';

// Views
import { DashboardView } from './views/DashboardView';
import { ProfilSekolahView } from './views/ProfilSekolahView';
import { ProfilGuruView } from './views/ProfilGuruView';
import { DataGuruView } from './views/DataGuruView';
import { AgendaSupervisiView } from './views/AgendaSupervisiView';
import { TimelineSupervisiView } from './views/TimelineSupervisiView';
import { JadwalVisitasiView } from './views/JadwalVisitasiView';
import { ProgramSupervisiView } from './views/ProgramSupervisiView';
import { AdministrasiGuruView } from './views/AdministrasiGuruView';
import { TelaahRubricView } from './views/TelaahRubricView';
import { PraObservasiView } from './views/PraObservasiView';
import { SupervisiPembelajaranView } from './views/SupervisiPembelajaranView';
import { PascaObservasiView } from './views/PascaObservasiView';
import { HasilSupervisiView } from './views/HasilSupervisiView';
import { TindakLanjutView } from './views/TindakLanjutView';
import { LaporanHasilSupervisiView } from './views/LaporanHasilSupervisiView';
import { SertifikatView } from './views/SertifikatView';
import { PengaturanAiView } from './views/PengaturanAiView';

// Types & Mock
import {
  User,
  SchoolProfile,
  Teacher,
  VisitationSchedule,
  TeacherDocumentCheck,
  SupervisiPembelajaranRecord,
  PraObservasiRecord,
  PascaObservasiRecord,
  TindakLanjutRecord,
  TelaahAdmRecord,
  TimelineEntry,
  ProgramDocument,
  GuruUploadedDoc,
  LaporanDocument,
  TeacherCertificateRecord,
  CertificateSettings,
  AcademicPeriod,
  TeacherPersonalProfile,
} from './types/supervisi';

import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_USERS,
  INITIAL_TEACHERS,
  INITIAL_TEACHER_PROFILES,
  INITIAL_VISITATION,
  INITIAL_ADMINISTRASI_GURU,
  INITIAL_SUPERVISI_KBM,
  INITIAL_PRA_OBSERVASI,
  INITIAL_PASCA_OBSERVASI,
  INITIAL_TINDAK_LANJUT,
  INITIAL_TELAAH_ADM,
  INITIAL_TIMELINE_SUPERVISI,
  INITIAL_PROGRAM_DOCUMENTS,
  INITIAL_GURU_UPLOADED_DOCS,
  INITIAL_LAPORAN_DOCUMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_CERTIFICATE_SETTINGS,
  INITIAL_ACADEMIC_PERIODS,
  STORAGE_KEYS,
  getStoredData,
  saveStoredData,
} from './data/mockData';

export default function App() {
  // State with LocalStorage fallbacks - default to Admin (matches 0.1.1_3225437e.png)
  const [currentUser, setCurrentUser] = useState<User>(() =>
    getStoredData<User>(STORAGE_KEYS.ACTIVE_USER, INITIAL_USERS[0])
  );
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('super_guru_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('super_guru_sidebar_collapsed', String(isSidebarCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [isSidebarCollapsed]);

  const [school, setSchool] = useState<SchoolProfile>(() =>
    getStoredData<SchoolProfile>(STORAGE_KEYS.PROFILE, INITIAL_SCHOOL_PROFILE)
  );
  const [teachers, setTeachers] = useState<Teacher[]>(() =>
    getStoredData<Teacher[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS)
  );
  const [teacherProfiles, setTeacherProfiles] = useState<TeacherPersonalProfile[]>(() =>
    getStoredData<TeacherPersonalProfile[]>(
      STORAGE_KEYS.TEACHER_PROFILES,
      INITIAL_TEACHER_PROFILES
    )
  );
  const [schedules, setSchedules] = useState<VisitationSchedule[]>(() =>
    getStoredData<VisitationSchedule[]>(STORAGE_KEYS.VISITATION, INITIAL_VISITATION)
  );
  const [documents, setDocuments] = useState<TeacherDocumentCheck[]>(() =>
    getStoredData<TeacherDocumentCheck[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_ADMINISTRASI_GURU)
  );
  const [supervisiKBM, setSupervisiKBM] = useState<SupervisiPembelajaranRecord[]>(() =>
    getStoredData<SupervisiPembelajaranRecord[]>(
      STORAGE_KEYS.SUPERVISI_KBM,
      INITIAL_SUPERVISI_KBM
    )
  );
  const [praRecords, setPraRecords] = useState<PraObservasiRecord[]>(() =>
    getStoredData<PraObservasiRecord[]>(STORAGE_KEYS.PRA_OBSERVASI, INITIAL_PRA_OBSERVASI)
  );
  const [pascaRecords, setPascaRecords] = useState<PascaObservasiRecord[]>(() =>
    getStoredData<PascaObservasiRecord[]>(
      STORAGE_KEYS.PASCA_OBSERVASI,
      INITIAL_PASCA_OBSERVASI
    )
  );
  const [tindakLanjutList, setTindakLanjutList] = useState<TindakLanjutRecord[]>(() =>
    getStoredData<TindakLanjutRecord[]>(STORAGE_KEYS.TINDAK_LANJUT, INITIAL_TINDAK_LANJUT)
  );
  const [telaahAdm, setTelaahAdm] = useState<TelaahAdmRecord[]>(() =>
    getStoredData<TelaahAdmRecord[]>(STORAGE_KEYS.TELAAH_ADM, INITIAL_TELAAH_ADM)
  );
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>(() =>
    getStoredData<TimelineEntry[]>(STORAGE_KEYS.TIMELINE_SUPERVISI, INITIAL_TIMELINE_SUPERVISI)
  );
  const [programDocs, setProgramDocs] = useState<ProgramDocument[]>(() =>
    getStoredData<ProgramDocument[]>(STORAGE_KEYS.PROGRAM_DOCS, INITIAL_PROGRAM_DOCUMENTS)
  );
  const [uploadedGuruDocs, setUploadedGuruDocs] = useState<GuruUploadedDoc[]>(() =>
    getStoredData<GuruUploadedDoc[]>(STORAGE_KEYS.GURU_UPLOADED_DOCS, INITIAL_GURU_UPLOADED_DOCS)
  );
  const [laporanDocs, setLaporanDocs] = useState<LaporanDocument[]>(() =>
    getStoredData<LaporanDocument[]>(STORAGE_KEYS.LAPORAN_DOCS, INITIAL_LAPORAN_DOCUMENTS)
  );
  const [certificates, setCertificates] = useState<TeacherCertificateRecord[]>(() =>
    getStoredData<TeacherCertificateRecord[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES)
  );
  const [certSettings, setCertSettings] = useState<CertificateSettings>(() =>
    getStoredData<CertificateSettings>(
      STORAGE_KEYS.CERTIFICATE_SETTINGS,
      INITIAL_CERTIFICATE_SETTINGS
    )
  );
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>(() =>
    getStoredData<AcademicPeriod[]>(STORAGE_KEYS.ACADEMIC_PERIODS, INITIAL_ACADEMIC_PERIODS)
  );

  // Sync state to storage
  useEffect(() => {
    saveStoredData(STORAGE_KEYS.ACTIVE_USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PROFILE, school);
  }, [school]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TEACHERS, teachers);
  }, [teachers]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TEACHER_PROFILES, teacherProfiles);
  }, [teacherProfiles]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.VISITATION, schedules);
  }, [schedules]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.DOCUMENTS, documents);
  }, [documents]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.SUPERVISI_KBM, supervisiKBM);
  }, [supervisiKBM]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PRA_OBSERVASI, praRecords);
  }, [praRecords]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PASCA_OBSERVASI, pascaRecords);
  }, [pascaRecords]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TINDAK_LANJUT, tindakLanjutList);
  }, [tindakLanjutList]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.TIMELINE_SUPERVISI, timelineEntries);
  }, [timelineEntries]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.PROGRAM_DOCS, programDocs);
  }, [programDocs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.GURU_UPLOADED_DOCS, uploadedGuruDocs);
  }, [uploadedGuruDocs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.LAPORAN_DOCS, laporanDocs);
  }, [laporanDocs]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CERTIFICATES, certificates);
  }, [certificates]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.CERTIFICATE_SETTINGS, certSettings);
  }, [certSettings]);

  useEffect(() => {
    saveStoredData(STORAGE_KEYS.ACADEMIC_PERIODS, academicPeriods);
  }, [academicPeriods]);

  // Handlers
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setIsLoggedOut(false);
    setIsLoginModalOpen(false);

    if (user.role === 'admin') {
      const adminTabs: NavTab[] = [
        'dashboard',
        'profil_sekolah',
        'data_guru',
        'timeline_supervisi',
        'jadwal_visitasi',
        'program_supervisi',
        'administrasi_guru',
        'hasil_supervisi',
        'tindak_lanjut',
        'laporan_supervisi',
        'sertifikat',
        'pengaturan_ai',
      ];
      if (!adminTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (user.role === 'kepala_sekolah') {
      const supervisorTabs: NavTab[] = [
        'dashboard',
        'profil_sekolah',
        'data_guru',
        'agenda_supervisi',
        'jadwal_visitasi',
        'program_supervisi',
        'telaah_adm',
        'telaah_atp',
        'telaah_modul',
        'pra_observasi',
        'supervisi_pembelajaran',
        'pasca_observasi',
        'supervisi_asesmen',
        'hasil_supervisi',
        'tindak_lanjut',
        'laporan_supervisi',
      ];
      if (!supervisorTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (user.role === 'guru') {
      const guruTabs: NavTab[] = [
        'dashboard',
        'profil_sekolah',
        'profil_guru',
        'timeline_supervisi',
        'jadwal_visitasi',
        'administrasi_guru',
        'pra_observasi',
        'pasca_observasi',
        'hasil_supervisi',
        'tindak_lanjut',
        'sertifikat',
      ];
      if (!guruTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedOut(true);
  };

  const handleUpdateSchool = (updated: SchoolProfile) => {
    setSchool(updated);
    // Keep academicPeriods synchronized with active school tahunAjaran & semester
    setAcademicPeriods((prev) => {
      const exists = prev.some(
        (p) =>
          p.tahunAjaran.toLowerCase() === updated.tahunAjaran.toLowerCase() &&
          p.semester === updated.semester
      );
      const targetStatus: 'Aktif' | 'Off' =
        updated.periodeStatus === 'Off' ? 'Off' : 'Aktif';
      if (exists) {
        return prev.map((p) => {
          const isMatch =
            p.tahunAjaran.toLowerCase() === updated.tahunAjaran.toLowerCase() &&
            p.semester === updated.semester;
          if (targetStatus === 'Aktif') {
            return { ...p, status: isMatch ? 'Aktif' : 'Off' };
          }
          return isMatch ? { ...p, status: 'Off' } : p;
        });
      }
      const newEntry: AcademicPeriod = {
        id: `ap-${Date.now()}`,
        tahunAjaran: updated.tahunAjaran,
        semester: updated.semester,
        status: targetStatus,
      };
      return targetStatus === 'Aktif'
        ? [...prev.map((p) => ({ ...p, status: 'Off' as const })), newEntry]
        : [...prev, newEntry];
    });
  };

  const handleUpdateAcademicPeriods = (periods: AcademicPeriod[]) => {
    setAcademicPeriods(periods);
    const activePeriod = periods.find((p) => p.status === 'Aktif');
    if (activePeriod) {
      setSchool((prev) => ({
        ...prev,
        tahunAjaran: activePeriod.tahunAjaran,
        semester: activePeriod.semester,
        periodeStatus: 'Aktif',
      }));
    } else {
      setSchool((prev) => ({
        ...prev,
        periodeStatus: 'Off',
      }));
    }
  };

  const handleAddTeacher = (teacher: Teacher) => {
    setTeachers((prev) => [teacher, ...prev]);
  };

  const handleUpdateTeacher = (teacher: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === teacher.id ? teacher : t)));
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveTeacherProfile = (profile: TeacherPersonalProfile) => {
    setTeacherProfiles((prev) => {
      const idx = prev.findIndex((p) => p.guruId === profile.guruId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = profile;
        return copy;
      }
      return [...prev, profile];
    });
  };

  const handleAddSchedule = (sched: VisitationSchedule) => {
    setSchedules((prev) => [sched, ...prev]);
  };

  const handleUpdateSchedule = (updated: VisitationSchedule) => {
    setSchedules((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleUpdateScheduleStatus = (id: string, status: VisitationSchedule['status']) => {
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateDocument = (doc: TeacherDocumentCheck) => {
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === doc.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = doc;
        return copy;
      }
      return [doc, ...prev];
    });
  };

  const handleSavePraObservasi = (record: PraObservasiRecord) => {
    setPraRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id || r.guruId === record.guruId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  };

  const handleSaveSupervisiKBM = (record: SupervisiPembelajaranRecord) => {
    setSupervisiKBM((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id || r.guruId === record.guruId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  };

  const handleSavePascaObservasi = (record: PascaObservasiRecord) => {
    setPascaRecords((prev) => {
      const idx = prev.findIndex((r) => r.id === record.id || r.guruId === record.guruId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
  };

  const handleAddTindakLanjut = (item: TindakLanjutRecord) => {
    setTindakLanjutList((prev) => [item, ...prev]);
  };

  const handleUpdateTindakLanjutStatus = (id: string, status: TindakLanjutRecord['status']) => {
    setTindakLanjutList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleAddTimelineEntry = (entry: TimelineEntry) => {
    setTimelineEntries((prev) => [...prev, entry]);
  };

  const handleUpdateTimelineEntry = (entry: TimelineEntry) => {
    setTimelineEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
  };

  const handleDeleteTimelineEntry = (id: string) => {
    setTimelineEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddProgramDoc = (doc: ProgramDocument) => {
    setProgramDocs((prev) => [doc, ...prev]);
  };

  const handleUpdateProgramDoc = (doc: ProgramDocument) => {
    setProgramDocs((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
  };

  const handleDeleteProgramDoc = (id: string) => {
    setProgramDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddGuruDoc = (doc: GuruUploadedDoc) => {
    setUploadedGuruDocs((prev) => [doc, ...prev]);
  };

  const handleUpdateGuruDoc = (doc: GuruUploadedDoc) => {
    setUploadedGuruDocs((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
  };

  const handleDeleteGuruDoc = (id: string) => {
    setUploadedGuruDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddLaporanDoc = (doc: LaporanDocument) => {
    setLaporanDocs((prev) => [doc, ...prev]);
  };

  const handleUpdateLaporanDoc = (doc: LaporanDocument) => {
    setLaporanDocs((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
  };

  const handleDeleteLaporanDoc = (id: string) => {
    setLaporanDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSaveCertificate = (record: TeacherCertificateRecord) => {
    setCertificates((prev) => {
      const idx = prev.findIndex((c) => c.guruId === record.guruId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  // Render view depending on active tab
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            teachers={teachers}
            schedules={schedules}
            supervisiKBM={supervisiKBM}
            telaahAdm={telaahAdm}
            currentUser={currentUser}
            school={school}
            setActiveTab={setActiveTab}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        );

      case 'profil_sekolah':
        return (
          <ProfilSekolahView
            school={school}
            onUpdateSchool={handleUpdateSchool}
            academicPeriods={academicPeriods}
            onUpdateAcademicPeriods={handleUpdateAcademicPeriods}
            currentUser={currentUser}
          />
        );

      case 'profil_guru':
        return (
          <ProfilGuruView
            currentUser={currentUser}
            teachers={teachers}
            school={school}
            teacherProfiles={teacherProfiles}
            onSaveTeacherProfile={handleSaveTeacherProfile}
          />
        );

      case 'data_guru':
        return (
          <DataGuruView
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            currentUser={currentUser}
            schedules={schedules}
            setActiveTab={setActiveTab}
          />
        );

      case 'agenda_supervisi':
        return <AgendaSupervisiView school={school} setActiveTab={setActiveTab} />;

      case 'timeline_supervisi':
        return (
          <TimelineSupervisiView
            school={school}
            entries={timelineEntries}
            onAddEntry={handleAddTimelineEntry}
            onUpdateEntry={handleUpdateTimelineEntry}
            onDeleteEntry={handleDeleteTimelineEntry}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
          />
        );

      case 'jadwal_visitasi':
        return (
          <JadwalVisitasiView
            schedules={schedules}
            teachers={teachers}
            school={school}
            currentUser={currentUser}
            onAddSchedule={handleAddSchedule}
            onUpdateSchedule={handleUpdateSchedule}
            onUpdateScheduleStatus={handleUpdateScheduleStatus}
            onDeleteSchedule={handleDeleteSchedule}
            setActiveTab={setActiveTab}
          />
        );

      case 'program_supervisi':
        return (
          <ProgramSupervisiView
            school={school}
            currentUser={currentUser}
            programDocs={programDocs}
            onAddProgramDoc={handleAddProgramDoc}
            onUpdateProgramDoc={handleUpdateProgramDoc}
            onDeleteProgramDoc={handleDeleteProgramDoc}
          />
        );

      case 'administrasi_guru':
        return (
          <AdministrasiGuruView
            teachers={teachers}
            documents={documents}
            onUpdateDocument={handleUpdateDocument}
            onAddDocument={(doc) => setDocuments((prev) => [doc, ...prev])}
            uploadedGuruDocs={uploadedGuruDocs}
            onAddGuruDoc={handleAddGuruDoc}
            onUpdateGuruDoc={handleUpdateGuruDoc}
            onDeleteGuruDoc={handleDeleteGuruDoc}
            school={school}
            currentUser={currentUser}
          />
        );

      case 'telaah_adm':
      case 'telaah_atp':
      case 'telaah_modul':
      case 'supervisi_asesmen':
        return (
          <TelaahRubricView
            key={activeTab}
            type={activeTab}
            teachers={teachers}
            school={school}
            currentUser={currentUser}
            uploadedGuruDocs={uploadedGuruDocs}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        );

      case 'pra_observasi':
        return (
          <PraObservasiView
            teachers={teachers}
            praRecords={praRecords}
            onSaveRecord={handleSavePraObservasi}
            school={school}
            currentUser={currentUser}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        );

      case 'supervisi_pembelajaran':
        return (
          <SupervisiPembelajaranView
            teachers={teachers}
            supervisiRecords={supervisiKBM}
            onSaveRecord={handleSaveSupervisiKBM}
            school={school}
            uploadedGuruDocs={uploadedGuruDocs}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        );

      case 'pasca_observasi':
        return (
          <PascaObservasiView
            teachers={teachers}
            pascaRecords={pascaRecords}
            onSaveRecord={handleSavePascaObservasi}
            school={school}
            currentUser={currentUser}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        );

      case 'hasil_supervisi':
        return (
          <HasilSupervisiView
            teachers={teachers}
            supervisiKBM={supervisiKBM}
            telaahAdm={telaahAdm}
            praRecords={praRecords}
            pascaRecords={pascaRecords}
            tindakLanjutList={tindakLanjutList}
            school={school}
            setActiveTab={setActiveTab}
          />
        );

      case 'tindak_lanjut':
        return (
          <TindakLanjutView
            teachers={teachers}
            tindakLanjutList={tindakLanjutList}
            onAddTindakLanjut={handleAddTindakLanjut}
            onUpdateStatus={handleUpdateTindakLanjutStatus}
            school={school}
            currentUser={currentUser}
          />
        );

      case 'laporan_supervisi':
        return (
          <LaporanHasilSupervisiView
            school={school}
            teachers={teachers}
            supervisiKBM={supervisiKBM}
            telaahAdm={telaahAdm}
            tindakLanjutList={tindakLanjutList}
            laporanDocs={laporanDocs}
            onAddLaporanDoc={handleAddLaporanDoc}
            onUpdateLaporanDoc={handleUpdateLaporanDoc}
            onDeleteLaporanDoc={handleDeleteLaporanDoc}
            currentUser={currentUser}
          />
        );

      case 'sertifikat':
        if (currentUser.role === 'kepala_sekolah') {
          return (
            <DashboardView
              teachers={teachers}
              schedules={schedules}
              supervisiKBM={supervisiKBM}
              telaahAdm={telaahAdm}
              currentUser={currentUser}
              school={school}
              setActiveTab={setActiveTab}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            />
          );
        }
        return (
          <SertifikatView
            teachers={teachers}
            school={school}
            supervisiKBM={supervisiKBM}
            telaahAdm={telaahAdm}
            certificates={certificates}
            onSaveCertificate={handleSaveCertificate}
            certSettings={certSettings}
            onUpdateCertSettings={setCertSettings}
            currentUser={currentUser}
          />
        );

      case 'pengaturan_ai':
        if (currentUser.role !== 'admin') {
          return (
            <DashboardView
              teachers={teachers}
              schedules={schedules}
              supervisiKBM={supervisiKBM}
              telaahAdm={telaahAdm}
              currentUser={currentUser}
              school={school}
              setActiveTab={setActiveTab}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            />
          );
        }
        return (
          <PengaturanAiView
            school={school}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        );

      default:
        return (
          <DashboardView
            teachers={teachers}
            schedules={schedules}
            supervisiKBM={supervisiKBM}
            telaahAdm={telaahAdm}
            currentUser={currentUser}
            school={school}
            setActiveTab={setActiveTab}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-gray-900 antialiased print:h-auto print:w-auto print:overflow-visible print:bg-white">
      {/* Sidebar with EXACT design from user photo */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSwitchRole={() => setIsLoginModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 print:h-auto print:overflow-visible">
        <Navbar
          activeTab={activeTab}
          school={school}
          onUpdateSchool={handleUpdateSchool}
          academicPeriods={academicPeriods}
          onUpdateAcademicPeriods={handleUpdateAcademicPeriods}
          currentUser={currentUser}
          onOpenSwitchRole={() => setIsLoginModalOpen(true)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 print:overflow-visible print:p-0">
          {school.periodeStatus === 'Off' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs print:hidden">
              <div>
                <span className="font-bold">Status Tahun Pelajaran &amp; Semester: OFF.</span>{' '}
                <span>
                  Saat ini belum ada Tahun Ajaran yang berstatus Aktif (terakhir: TA {school.tahunAjaran} Semester {school.semester}).
                </span>
              </div>
              {activeTab !== 'profil_sekolah' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('profil_sekolah')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  Atur di Profil Sekolah
                </button>
              )}
            </div>
          )}
          {renderCurrentView()}
        </main>
      </div>

      {/* Role Switcher & Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen || isLoggedOut}
        isStandaloneScreen={isLoggedOut}
        onClose={() => setIsLoginModalOpen(false)}
        onSelectUser={handleSelectUser}
        availableUsers={INITIAL_USERS}
        teachers={teachers}
        currentUser={currentUser}
      />

      {/* AI Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        school={school}
        teachers={teachers}
      />
    </div>
  );
}
