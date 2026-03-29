'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const GRADES = ['大一', '大二', '大三', '大四', '研究生'];

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
  const [tab, setTab] = useState<'login' | 'register'>('register');

  // Register fields
  const [name, setName]       = useState('');
  const [sid, setSid]         = useState('');
  const [major, setMajor]     = useState('');
  const [grade, setGrade]     = useState('大一');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  // Login fields
  const [loginSid, setLoginSid]         = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  function handleRegister() {
    const profile = { name, studentId: sid, major, grade, email, password, mbti: '', zodiac: '', bio: '', aiStrengthSummary: '', resumeFileName: '', resumeFileSize: '', avatarColor: '#534AB7' };
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    router.push('/student/profile');
  }

  function handleLogin() {
    // No real auth — just merge studentId into any existing profile
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
        <p style={{ fontSize: 13, color: '#9B8EC4', marginTop: 4 }}>找到最适合你的大学社团</p>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px rgba(83,74,183,0.12)', padding: '28px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F5F3FF', borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {(['register', 'login'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 10,
                border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                background: tab === t ? '#534AB7' : 'transparent',
                color: tab === t ? '#fff' : '#9B8EC4',
                transition: 'all 0.2s',
              }}
            >
              {t === 'register' ? '注册' : '登录'}
            </button>
          ))}
        </div>

        {tab === 'register' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>姓名</label>
              <input style={inputStyle} placeholder="请输入真实姓名" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>学号</label>
              <input style={inputStyle} placeholder="请输入学号" value={sid} onChange={(e) => setSid(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>专业</label>
              <input style={inputStyle} placeholder="例：计算机科学" value={major} onChange={(e) => setMajor(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>年级</label>
              <select style={inputStyle} value={grade} onChange={(e) => setGrade(e.target.value)}>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>邮箱</label>
              <input style={inputStyle} type="email" placeholder="school@edu.cn" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>密码</label>
              <input style={inputStyle} type="password" placeholder="至少6位" value={password} onChange={(e) => setPassword(e.target.value)} />
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
              创建账号 →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>学号</label>
              <input style={inputStyle} placeholder="请输入学号" value={loginSid} onChange={(e) => setLoginSid(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>密码</label>
              <input style={inputStyle} type="password" placeholder="请输入密码" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
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
              登录
            </button>
          </div>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: '#B8AEDC' }}>
        登录即代表你同意 ClubMatch 用户协议
      </p>
    </div>
  );
}
