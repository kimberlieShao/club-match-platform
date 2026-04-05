'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';

const text = {
  zh: {
    slogan: '找到最适合你的大学社团',
    register: '注册', login: '登录',
    name: '姓名', namePlaceholder: '请输入真实姓名',
    studentId: '学号', studentIdPlaceholder: '请输入学号',
    major: '专业', majorPlaceholder: '例：计算机科学',
    grade: '年级', grades: ['大一', '大二', '大三', '大四', '研究生'],
    email: '邮箱', emailPlaceholder: 'school@edu.cn',
    password: '密码', passwordPlaceholder: '至少6位',
    createBtn: '创建账号 →', loginBtn: '登录 →',
    terms: '登录即代表你同意 ClubMatch 用户协议',
  },
  en: {
    slogan: 'Find your people on campus',
    register: 'Sign Up', login: 'Sign In',
    name: 'Full Name', namePlaceholder: 'Your full name',
    studentId: 'Student ID', studentIdPlaceholder: 'Enter your student ID',
    major: 'Major', majorPlaceholder: 'e.g. Computer Science',
    grade: 'Year', grades: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate Student'],
    email: 'Email', emailPlaceholder: 'your@university.edu',
    password: 'Password', passwordPlaceholder: 'At least 6 characters',
    createBtn: 'Create Account →', loginBtn: 'Sign In →',
    terms: 'By continuing, you agree to the ClubMatch Terms of Service',
  },
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  border: '1.5px solid #EDE9FF', borderRadius: 12,
  fontSize: 14, color: '#1A1240', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#6B5FA6', marginBottom: 6,
};

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = language === 'en' ? text.en : text.zh;

  const [tab, setTab] = useState<'login' | 'register'>('register');

  // Register fields
  const [name, setName]         = useState('');
  const [sid, setSid]           = useState('');
  const [major, setMajor]       = useState('');
  const [grade, setGrade]       = useState(t.grades[0]);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Login fields
  const [loginSid, setLoginSid]           = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  function handleRegister() {
    const profile = { name, studentId: sid, major, grade, email, password, mbti: '', zodiac: '', bio: '', aiStrengthSummary: '', resumeFileName: '', resumeFileSize: '', avatarColor: '#534AB7' };
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    router.push('/student/profile');
  }

  function handleLogin() {
    const stored = localStorage.getItem('studentProfile');
    const base = stored ? JSON.parse(stored) : {};
    localStorage.setItem('studentProfile', JSON.stringify({ ...base, studentId: loginSid }));
    router.push('/student/profile');
  }

  const registerReady = name && sid && major && email && password;
  const loginReady    = loginSid && loginPassword;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#EDE9FF 0%,#F5F3FF 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 40px' }}>
      {/* Logo */}
      <div style={{ paddingTop: 56, marginBottom: 32, textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 4px 16px rgba(83,74,183,0.3)' }}>
          <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>C</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A1240', margin: 0 }}>ClubMatch</h1>
        <p style={{ fontSize: 13, color: '#9B8EC4', marginTop: 4 }}>{t.slogan}</p>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(83,74,183,0.12)', padding: '28px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F5F3FF', borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {(['register', 'login'] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                background: tab === tabKey ? '#534AB7' : 'transparent',
                color: tab === tabKey ? '#fff' : '#9B8EC4',
                transition: 'all 0.2s',
              }}
            >
              {tabKey === 'register' ? t.register : t.login}
            </button>
          ))}
        </div>

        {tab === 'register' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>{t.name}</label>
              <input style={inputStyle} placeholder={t.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{t.studentId}</label>
              <input style={inputStyle} placeholder={t.studentIdPlaceholder} value={sid} onChange={(e) => setSid(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{t.major}</label>
              <input style={inputStyle} placeholder={t.majorPlaceholder} value={major} onChange={(e) => setMajor(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{t.grade}</label>
              <select style={inputStyle} value={grade} onChange={(e) => setGrade(e.target.value)}>
                {t.grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t.email}</label>
              <input style={inputStyle} type="email" placeholder={t.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{t.password}</label>
              <input style={inputStyle} type="password" placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button
              onClick={handleRegister}
              disabled={!registerReady}
              style={{
                width: '100%', padding: '15px 0', marginTop: 4,
                borderRadius: 14, border: 'none',
                background: registerReady ? '#534AB7' : '#C9C0F0',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: registerReady ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
            >
              {t.createBtn}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>{t.studentId}</label>
              <input style={inputStyle} placeholder={t.studentIdPlaceholder} value={loginSid} onChange={(e) => setLoginSid(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>{t.password}</label>
              <input style={inputStyle} type="password" placeholder={t.passwordPlaceholder} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            <button
              onClick={handleLogin}
              disabled={!loginReady}
              style={{
                width: '100%', padding: '15px 0', marginTop: 4,
                borderRadius: 14, border: 'none',
                background: loginReady ? '#534AB7' : '#C9C0F0',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: loginReady ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
            >
              {t.loginBtn}
            </button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#B8AEDC' }}>
        {t.terms}
      </p>
    </div>
  );
}
