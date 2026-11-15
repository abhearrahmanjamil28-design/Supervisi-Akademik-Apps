import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  X,
  AlertCircle,
  Info,
} from 'lucide-react';
import { User, UserRole, Teacher } from '../types/supervisi';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSelectUser: (user: User) => void;
  availableUsers: User[];
  teachers?: Teacher[];
  currentUser: User;
  isStandaloneScreen?: boolean;
}

const REMEMBER_STORAGE_KEY = 'super_guru_remember_login';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  availableUsers,
  teachers = [],
  currentUser,
  isStandaloneScreen = false,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    currentUser?.role || 'admin'
  );
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotHint, setShowForgotHint] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    setShowForgotHint(false);

    try {
      const savedRaw = localStorage.getItem(REMEMBER_STORAGE_KEY);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw) as {
          role?: UserRole;
          username?: string;
        };
        if (saved.role) setSelectedRole(saved.role);
        if (saved.username) setUsernameInput(saved.username);
        setRememberMe(true);
        return;
      }
    } catch {
      // ignore invalid storage
    }

    if (currentUser?.role) {
      setSelectedRole(currentUser.role);
    }
  }, [isOpen, currentUser?.role]);

  if (!isOpen) return null;

  const persistRemember = (role: UserRole, username: string) => {
    try {
      if (rememberMe) {
        localStorage.setItem(
          REMEMBER_STORAGE_KEY,
          JSON.stringify({ role, username })
        );
      } else {
        localStorage.removeItem(REMEMBER_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const normalizedUser = usernameInput.trim().toLowerCase();
    const rawPassword = passwordInput.trim();

    if (!normalizedUser || !rawPassword) {
      setErrorMsg('Silakan masukkan Username dan Password terlebih dahulu.');
      return;
    }

    if (selectedRole === 'admin') {
      const adminUser = availableUsers.find((u) => u.role === 'admin');
      const validAdminUsernames = [
        'admin',
        adminUser?.email.toLowerCase(),
        adminUser?.nip?.toLowerCase(),
      ].filter(Boolean);
      const validAdminPasswords = ['admin', 'admin123', '123456'];

      if (
        !validAdminUsernames.includes(normalizedUser) ||
        !validAdminPasswords.includes(rawPassword)
      ) {
        setErrorMsg(
          'Username atau Password Admin tidak sesuai. Klik "Forgot Password?" untuk melihat info akses.'
        );
        return;
      }

      persistRemember('admin', usernameInput.trim());
      onSelectUser(
        adminUser || {
          id: 'user-admin',
          name: 'Admin',
          role: 'admin',
          email: 'admin.supervisi@smaplusuq.sch.id',
          title: 'Administrator',
        }
      );
      if (onClose) onClose();
      return;
    }

    if (selectedRole === 'kepala_sekolah') {
      const kepsekUser = availableUsers.find((u) => u.role === 'kepala_sekolah');
      const validKepsekUsernames = [
        'supervisor',
        'supervisior',
        'kepsek',
        'kepala_sekolah',
        'kepalasekolah',
        kepsekUser?.email.toLowerCase(),
        kepsekUser?.nip?.toLowerCase(),
      ].filter(Boolean);
      const validKepsekPasswords = [
        'supervisor',
        'supervisor123',
        'supervisior',
        'kepsek',
        'kepsek123',
        'admin123',
        '123456',
      ];

      if (
        !validKepsekUsernames.includes(normalizedUser) ||
        !validKepsekPasswords.includes(rawPassword)
      ) {
        setErrorMsg(
          'Username atau Password Supervisor tidak sesuai. Klik "Forgot Password?" untuk melihat info akses.'
        );
        return;
      }

      persistRemember('kepala_sekolah', usernameInput.trim());
      onSelectUser(
        kepsekUser || {
          id: 'user-kepsek',
          name: 'Drs. H. Ahmad Mustofa, M.Pd.',
          role: 'kepala_sekolah',
          email: 'kepsek@smaplusuq-almustofa.sch.id',
          title: 'Supervisor',
        }
      );
      if (onClose) onClose();
      return;
    }

    // Guru role: match against teachers list (synced with Admin Data Guru) and availableUsers
    const matchedTeacher = teachers.find(
      (t) =>
        (t.username && t.username.toLowerCase() === normalizedUser) ||
        t.email.toLowerCase() === normalizedUser ||
        t.email.split('@')[0].toLowerCase() === normalizedUser ||
        (t.nip && t.nip.toLowerCase() === normalizedUser)
    );

    if (matchedTeacher) {
      const expectedPassword = matchedTeacher.password || 'guru1234';
      if (rawPassword !== expectedPassword) {
        setErrorMsg(
          'Password Guru tidak sesuai dengan data akun di laman Admin.'
        );
        return;
      }

      persistRemember('guru', usernameInput.trim());
      onSelectUser({
        id: matchedTeacher.id,
        name: `${matchedTeacher.nama}, ${matchedTeacher.gelar}`,
        nip: matchedTeacher.nip,
        role: 'guru',
        email: matchedTeacher.email,
        subject: matchedTeacher.mapel,
        title: `Guru ${matchedTeacher.mapel}`,
      });
      if (onClose) onClose();
      return;
    }

    const matchedAvailableGuru = availableUsers.find(
      (u) =>
        u.role === 'guru' &&
        (u.email.toLowerCase() === normalizedUser ||
          u.email.split('@')[0].toLowerCase() === normalizedUser ||
          (u.nip && u.nip.toLowerCase() === normalizedUser))
    );

    if (matchedAvailableGuru && rawPassword === 'guru1234') {
      persistRemember('guru', usernameInput.trim());
      onSelectUser(matchedAvailableGuru);
      if (onClose) onClose();
      return;
    }

    setErrorMsg(
      'Akun Guru tidak ditemukan. Periksa kembali Username dan Password dari Data Guru.'
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isStandaloneScreen ? 'bg-white' : 'bg-black/60 backdrop-blur-xs p-0 sm:p-4 md:p-6'
      }`}
    >
      <div
        className={`w-full bg-white flex flex-col lg:flex-row overflow-hidden relative ${
          isStandaloneScreen
            ? 'h-screen w-screen'
            : 'max-w-5xl min-h-[600px] lg:h-[640px] rounded-none sm:rounded-3xl shadow-2xl border border-emerald-950/15'
        }`}
      >
        {/* Left Brand Panel (#072408 deep dark green matching 0.0_27bd3ffa.jpg) */}
        <div className="lg:w-[48%] bg-[#072408] text-white px-8 py-10 sm:px-12 sm:py-12 lg:px-14 lg:py-14 flex flex-col justify-between gap-10 select-none">
          <div className="space-y-4 max-w-md">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.12] tracking-tight text-white">
              Administrasi
              <br />
              Supervisi Guru
            </h1>

            <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-white leading-snug pt-1">
              SMA Plus Ulumul Qur’an Al-Mustofa
            </h2>

            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal pt-1">
              Aplikasi berbasis web untuk memudahkan kepala sekolah atau pengawas
              dalam melakukan supervisi akademik kepada guru. Aplikasi ini
              mencakup pencatatan rencana supervisi, pengisian instrumen
              observasi kelas, penilaian kinerja, dan rekapitulasi laporan
              secara digital.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-white">
              Ahlan Wasahlan
            </p>
          </div>
        </div>

        {/* Right Login Form Panel (Pure white matching 0.0_27bd3ffa.jpg) */}
        <div className="flex-1 bg-white px-8 py-10 sm:px-12 lg:px-16 flex flex-col justify-center items-center relative overflow-y-auto">
          {!isStandaloneScreen && onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Tutup"
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-7">
              Log in
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Role Selector Pill */}
              <div className="relative flex items-center bg-[#e5e7eb] rounded-full px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-[#072408]/30">
                <UserIcon className="w-4 h-4 text-gray-800 fill-gray-800 shrink-0 mr-3" />
                <select
                  aria-label="Pilih Peran"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full bg-transparent text-sm text-gray-700 italic font-medium appearance-none focus:outline-none pr-6 cursor-pointer"
                >
                  <option value="admin" className="not-italic text-gray-900">
                    Admin
                  </option>
                  <option
                    value="kepala_sekolah"
                    className="not-italic text-gray-900"
                  >
                    Supervisor
                  </option>
                  <option value="guru" className="not-italic text-gray-900">
                    Guru
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 pointer-events-none absolute right-4" />
              </div>

              {/* Username Input Pill */}
              <div className="relative flex items-center bg-[#e5e7eb] rounded-full px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-[#072408]/30">
                <UserIcon className="w-4 h-4 text-gray-800 fill-gray-800 shrink-0 mr-3" />
                <input
                  type="text"
                  aria-label="Username"
                  placeholder="Username"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-500 placeholder:italic focus:outline-none"
                />
              </div>

              {/* Password Input Pill */}
              <div className="relative flex items-center bg-[#e5e7eb] rounded-full px-4 py-3 transition-colors focus-within:ring-2 focus-within:ring-[#072408]/30">
                <Lock className="w-4 h-4 text-gray-800 shrink-0 mr-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  aria-label="Password"
                  placeholder="Password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-500 placeholder:italic focus:outline-none pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Lihat password'
                  }
                  className="text-gray-500 hover:text-gray-800 cursor-pointer absolute right-4"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs text-gray-500 italic px-1 pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-gray-400 text-[#072408] focus:ring-[#072408] cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotHint((prev) => !prev)}
                  className="hover:text-gray-800 underline-offset-2 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {showForgotHint && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed">
                  <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Informasi Akun Bawaan:</p>
                    <p>
                      • <strong>Admin</strong>: username{' '}
                      <code className="font-mono">admin</code>, password{' '}
                      <code className="font-mono">admin123</code>
                    </p>
                    <p>
                      • <strong>Supervisor</strong>: username{' '}
                      <code className="font-mono">supervisor</code>, password{' '}
                      <code className="font-mono">supervisor123</code> (atau{' '}
                      <code className="font-mono">kepsek</code> /{' '}
                      <code className="font-mono">kepsek123</code>)
                    </p>
                    <p>
                      • <strong>Guru</strong>: gunakan username &amp; password di
                      menu Data Guru (mis.{' '}
                      <code className="font-mono">siti.nurhaliza</code> /{' '}
                      <code className="font-mono">guru1234</code>)
                    </p>
                  </div>
                </div>
              )}

              {/* Divider Line */}
              <div className="border-t border-gray-400/70 my-3" />

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-6 rounded-full bg-[#072408] hover:bg-[#0d3a0f] active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
              >
                Log in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
