'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';

// ─── Constants ────────────────────────────────────────────────────────────────

const GRADES   = ['大一', '大二', '大三', '大四', '研究生'];
const MBTI_LIST = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
                   'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
const ZODIAC_LIST = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座',
                     '天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];
const AVATAR_COLORS = ['#534AB7','#7C3AED','#0891B2','#059669','#DC2626'];

interface Profile {
  name: string; studentId: string; major: string; grade: string; email: string;
  mbti: string; zodiac: string; bio: string;
  aiStrengthSummary: string;
  resumeFileName: string; resumeFileSize: string;
  avatarColor: string;
}

const EMPTY: Profile = {
  name: '', studentId: '', major: '', grade: '大一', email: '',
  mbti: '', zodiac: '', bio: '',
  aiStrengthSummary: '', resumeFileName: '', resumeFileSize: '',
  avatarColor: '#534AB7',
};

// ─── Shared input style ───────────────────────────────────────────────────────

const field: React.CSSProperties = {
  width: '100%', padding: '11px 13px',
  border: '1.5px solid #EDE9FF', borderRadius: 12,
  fontSize: 14, color: '#1A1240', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
};

// ─── Section wrapper ─────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', marginBottom: 14, boxShadow: '0 1px 4px rgba(83,74,183,0.07)' }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1240', marginBottom: 16 }}>{title}</h2>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#9B8EC4', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [bioLoading, setBioLoading]       = useState(false);
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [savedMsg, setSavedMsg]           = useState('');
  const [avatarIdx, setAvatarIdx]         = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('studentProfile');
    if (raw) {
      const p: Profile = { ...EMPTY, ...JSON.parse(raw) };
      setProfile(p);
      const ci = AVATAR_COLORS.indexOf(p.avatarColor);
      if (ci >= 0) setAvatarIdx(ci);
    }
  }, []);

  function set<K extends keyof Profile>(k: K, v: Profile[K]) {
    setProfile((prev) => ({ ...prev, [k]: v }));
  }

  function cycleAvatar() {
    const next = (avatarIdx + 1) % AVATAR_COLORS.length;
    setAvatarIdx(next);
    set('avatarColor', AVATAR_COLORS[next]);
  }

  function save() {
    localStorage.setItem('studentProfile', JSON.stringify({ ...profile, avatarColor: AVATAR_COLORS[avatarIdx] }));
    setSavedMsg('已保存 ✓');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  async function handleBioCopilot() {
    setBioLoading(true);
    try {
      const msg = `请帮我写一段约60字的个人简介。用户信息：姓名${profile.name || '同学'}，专业${profile.major || '未知'}，年级${profile.grade}，MBTI${profile.mbti || '未知'}，星座${profile.zodiac || '未知'}。请突出个人特点和对社团活动的热情，语气亲切自然。`;
      const res  = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      set('bio', data.reply || profile.bio);
    } catch { /* keep existing */ }
    setBioLoading(false);
  }

  async function handleResumeAnalyze() {
    setResumeAnalyzing(true);
    try {
      const msg = `请根据以下简历文件名和用户信息，生成一段100字以内的个人优势总结，突出适合社团活动的特质。用户信息：${profile.name || '同学'}，${profile.major || '未知专业'}，${profile.grade}，简历文件：${profile.resumeFileName}。${profile.bio ? '个人简介：' + profile.bio : ''}`;
      const res  = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      set('aiStrengthSummary', data.reply || '');
    } catch { /* keep existing */ }
    setResumeAnalyzing(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const sizeKB = Math.round(f.size / 1024);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    set('resumeFileName', f.name);
    set('resumeFileSize', sizeStr);
    set('aiStrengthSummary', '');
  }

  const avatarColor = AVATAR_COLORS[avatarIdx];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7FF' }}>
      <Navbar title="我的资料" />

      <main style={{ padding: '16px 16px 100px' }}>

        {/* ── Section 1: Basic Info ── */}
        <Section title="基本信息">
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={cycleAvatar}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: `linear-gradient(135deg,${avatarColor},${avatarColor}CC)`,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 800, color: '#fff',
                  boxShadow: `0 4px 16px ${avatarColor}55`,
                }}
              >
                {profile.name ? profile.name[0] : '?'}
              </button>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: '50%', background: '#fff', border: `2px solid ${avatarColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                🎨
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#B8AEDC', marginTop: -12, marginBottom: 16 }}>点击头像更换颜色</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <FieldRow label="姓名">
              <input style={field} value={profile.name} onChange={(e) => set('name', e.target.value)} placeholder="真实姓名" />
            </FieldRow>
            <FieldRow label="学号">
              <input style={field} value={profile.studentId} onChange={(e) => set('studentId', e.target.value)} placeholder="学号" />
            </FieldRow>
          </div>

          <FieldRow label="专业">
            <input style={field} value={profile.major} onChange={(e) => set('major', e.target.value)} placeholder="例：计算机科学" />
          </FieldRow>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <FieldRow label="年级">
              <select style={field} value={profile.grade} onChange={(e) => set('grade', e.target.value)}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="邮箱">
              <input style={field} value={profile.email} onChange={(e) => set('email', e.target.value)} placeholder="school@edu.cn" type="email" />
            </FieldRow>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <FieldRow label="MBTI">
              <select style={field} value={profile.mbti} onChange={(e) => set('mbti', e.target.value)}>
                <option value="">未知</option>
                {MBTI_LIST.map((m) => <option key={m}>{m}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="星座">
              <select style={field} value={profile.zodiac} onChange={(e) => set('zodiac', e.target.value)}>
                <option value="">未知</option>
                {ZODIAC_LIST.map((z) => <option key={z}>{z}</option>)}
              </select>
            </FieldRow>
          </div>

          <FieldRow label="个人简介">
            <div style={{ position: 'relative' }}>
              <textarea
                rows={4}
                style={{ ...field, resize: 'none', paddingBottom: 36 }}
                value={profile.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="介绍一下你自己，加入社团的期望等…"
              />
              <button
                onClick={handleBioCopilot}
                disabled={bioLoading}
                style={{
                  position: 'absolute', bottom: 10, right: 10,
                  padding: '5px 10px', borderRadius: 8,
                  border: '1px solid #C9C0F0', background: '#F5F3FF',
                  color: '#534AB7', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {bioLoading ? '生成中…' : '✨ AI 帮我写'}
              </button>
            </div>
          </FieldRow>
        </Section>

        {/* ── Section 2: Resume ── */}
        <Section title="我的简历">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {!profile.resumeFileName ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', padding: '18px 0',
                borderRadius: 14, border: '2px dashed #C9C0F0',
                background: '#F5F3FF', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 28 }}>📎</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#534AB7' }}>上传简历（PDF）</span>
              <span style={{ fontSize: 12, color: '#9B8EC4' }}>支持 .pdf 格式</span>
            </button>
          ) : (
            <div>
              {/* File info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F5F3FF', borderRadius: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1240', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.resumeFileName}</p>
                  <p style={{ fontSize: 11, color: '#9B8EC4' }}>{profile.resumeFileSize}</p>
                </div>
                <button
                  onClick={() => { set('resumeFileName', ''); set('resumeFileSize', ''); set('aiStrengthSummary', ''); }}
                  style={{ fontSize: 18, color: '#9B8EC4', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Analyze button */}
              {!profile.aiStrengthSummary && (
                <button
                  onClick={handleResumeAnalyze}
                  disabled={resumeAnalyzing}
                  style={{
                    width: '100%', padding: '12px 0', borderRadius: 12,
                    border: 'none', background: '#534AB7',
                    color: '#fff', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', marginBottom: 12,
                  }}
                >
                  {resumeAnalyzing ? '✨ AI 解析中…' : '✨ AI 解析简历'}
                </button>
              )}

              {/* AI result */}
              {profile.aiStrengthSummary && (
                <div style={{ background: '#F5F3FF', borderRadius: 12, padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, background: '#EEEDFE', color: '#534AB7', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>AI 生成的个人优势</span>
                    <button
                      onClick={handleResumeAnalyze}
                      style={{ fontSize: 11, color: '#9B8EC4', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      重新生成
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: '#3C3489', lineHeight: 1.7 }}>{profile.aiStrengthSummary}</p>
                  <p style={{ fontSize: 11, color: '#B8AEDC', marginTop: 8 }}>📤 申请社团时将自动附上此摘要</p>
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: 12, color: '#9B8EC4', border: 'none', background: 'none', cursor: 'pointer', marginTop: 8 }}
              >
                重新上传
              </button>
            </div>
          )}
        </Section>

        {/* ── Section 3: Match Preferences ── */}
        <Section title="匹配偏好">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href="/student/quiz" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 14px', background: 'linear-gradient(135deg,#534AB7,#7C6FD6)', borderRadius: 14, cursor: 'pointer' }}>
                <span style={{ fontSize: 28 }}>📝</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>根据问卷匹配</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>10题 · 3分钟 · AI精准匹配</p>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}>→</span>
              </div>
            </Link>

            <Link href="/student/resume-match" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 14px', background: '#fff', borderRadius: 14, border: '1.5px solid #EDE9FF', cursor: 'pointer' }}>
                <span style={{ fontSize: 28 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1240', marginBottom: 2 }}>根据简历匹配</p>
                  <p style={{ fontSize: 12, color: '#9B8EC4' }}>上传简历 · AI提取关键词 · 智能匹配</p>
                </div>
                <span style={{ color: '#9B8EC4', fontSize: 18 }}>→</span>
              </div>
            </Link>
          </div>
        </Section>
      </main>

      {/* Sticky save bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', background: '#fff', borderTop: '1px solid #F0EEFF', display: 'flex', gap: 10 }}>
        <button
          onClick={() => router.push('/student/quiz')}
          style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: '1.5px solid #534AB7', background: '#F5F3FF', color: '#534AB7', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          开始匹配
        </button>
        <button
          onClick={save}
          style={{ flex: 2, padding: '13px 0', borderRadius: 12, border: 'none', background: '#534AB7', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          {savedMsg || '保存资料'}
        </button>
      </div>
    </div>
  );
}
