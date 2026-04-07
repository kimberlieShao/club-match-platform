'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { mockClubs } from '@/lib/mockData';
import { Club } from '@/lib/types';

interface ResumeResult {
  club: Club;
  score: number;
  reason: string;
}

const categoryColorStyle: Record<string, { background: string; color: string }> = {
  文艺: { background: '#FCE7F3', color: '#BE185D' },
  科技: { background: '#DBEAFE', color: '#1D4ED8' },
  体育: { background: '#D1FAE5', color: '#065F46' },
  学术: { background: '#FEF9C3', color: '#854D0E' },
  公益: { background: '#FFEDD5', color: '#9A3412' },
};

// Simulate keyword → club scoring
function scoreByKeywords(keywords: string[], club: Club): number {
  const tagMatches = club.tags.filter((t) =>
    keywords.some((kw) => t.includes(kw) || kw.includes(t))
  ).length;
  const base = Math.round((tagMatches / Math.max(club.tags.length, 1)) * 55 + club.rating * 9);
  return Math.min(97, Math.max(42, base));
}

// Fixed fallback keywords per club profile vibe (used when AI response isn't parseable)
const FALLBACK_KEYWORDS: Record<string, string[]> = {
  default: ['团队合作', '创新', '学习', '热情', '表达'],
};

export default function ResumeMatchPage() {
  const [file, setFile]           = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [keywords, setKeywords]   = useState<string[]>([]);
  const [results, setResults]     = useState<ResumeResult[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResults(null); setKeywords([]); }
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);

    const profile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
    const prompt  = `请根据简历文件名"${file.name}"和用户信息（${profile.major || '未知专业'} ${profile.grade || '大一'}学生${profile.bio ? '，简介：' + profile.bio.slice(0, 40) : ''}），提取3-5个最能描述这个人特质的中文关键词，用于匹配大学社团，直接列出关键词即可，用顿号分隔。`;

    let extractedKws: string[] = [];
    try {
      const res  = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: prompt }) });
      const data = await res.json();
      // Try to extract keywords from reply
      const raw = (data.reply as string) || '';
      const parts = raw.split(/[、，,\s]+/).filter((s: string) => s.length >= 2 && s.length <= 8);
      extractedKws = parts.length >= 2 ? parts.slice(0, 5) : FALLBACK_KEYWORDS.default;
    } catch {
      extractedKws = FALLBACK_KEYWORDS.default;
    }

    setKeywords(extractedKws);

    // Score each club
    const scored: ResumeResult[] = mockClubs.map((club) => {
      const score = scoreByKeywords(extractedKws, club);
      const topTag = club.tags.find((t) => extractedKws.some((kw) => t.includes(kw) || kw.includes(t))) || club.tags[0];
      const reason = `你的简历关键词与「${topTag}」高度匹配，${club.name}是很好的选择`;
      return { club, score, reason };
    }).sort((a, b) => b.score - a.score);

    setResults(scored);
    setAnalyzing(false);
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7FF' }}>
      <Navbar titleZh="简历智能匹配" titleEn="Resume Matching" />

      <main style={{ padding: '20px 16px 40px' }}>
        {/* Upload area */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(83,74,183,0.07)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1A1240', marginBottom: 6 }}>上传简历</h2>
          <p style={{ fontSize: 13, color: '#9B8EC4', marginBottom: 16 }}>AI 将自动提取关键特质，为你匹配最合适的社团</p>

          <input ref={fileInputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileSelect} />

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', padding: '22px 0', borderRadius: 14,
                border: '2px dashed #C9C0F0', background: '#F5F3FF',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 32 }}>📎</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#534AB7' }}>点击上传简历（PDF）</span>
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#F5F3FF', borderRadius: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>📄</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1240', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                  <p style={{ fontSize: 11, color: '#9B8EC4' }}>{Math.round(file.size / 1024)} KB</p>
                </div>
                <button onClick={() => { setFile(null); setResults(null); setKeywords([]); }} style={{ color: '#9B8EC4', border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
              </div>

              {!results && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 12,
                    border: 'none', background: analyzing ? '#C9C0F0' : '#534AB7',
                    color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {analyzing ? '✨ AI 分析中…' : '✨ AI 分析简历'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Keywords */}
        {keywords.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 16, boxShadow: '0 1px 4px rgba(83,74,183,0.07)' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9B8EC4', marginBottom: 10 }}>AI 提取的特质关键词</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {keywords.map((kw, i) => (
                <span key={i} style={{ padding: '5px 12px', borderRadius: 99, background: '#EDE9FF', color: '#534AB7', fontSize: 13, fontWeight: 600 }}>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div>
            <p style={{ fontSize: 14, color: '#6B5FA6', marginBottom: 14 }}>
              根据简历分析，为你找到以下社团 ↓
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((r, i) => {
                const isTop = i === 0;
                const cat   = categoryColorStyle[r.club.category] ?? { background: '#F3F4F6', color: '#374151' };
                return (
                  <Link key={r.club.id} href={`/student/club/${r.club.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: '#fff', borderRadius: 16, padding: '16px',
                      border: isTop ? '2px solid #534AB7' : '1.5px solid #EDE9FF',
                      boxShadow: isTop ? '0 4px 16px rgba(83,74,183,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                      position: 'relative',
                    }}>
                      {isTop && (
                        <div style={{ position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: 12 }}>
                          🏆 最适合你
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: isTop ? 80 : 0 }}>
                          <span style={{ fontSize: 13, color: '#9B8EC4' }}>#{i + 1}</span>
                          <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1240' }}>{r.club.name}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600, ...cat }}>{r.club.category}</span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 26, fontWeight: 800, color: '#534AB7', lineHeight: 1 }}>
                            {r.score}<span style={{ fontSize: 13, fontWeight: 500, color: '#9B8EC4' }}>%</span>
                          </div>
                          <div style={{ fontSize: 10, color: '#9B8EC4' }}>匹配度</div>
                        </div>
                      </div>

                      <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '9px 12px', marginBottom: 10, fontSize: 13, color: '#3C3489' }}>
                        ✨ {r.reason}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {r.club.tags.slice(0, 4).map((t, j) => (
                          <span key={j} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, background: '#EDE9FF', color: '#534AB7' }}>{t}</span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#9B8EC4' }}>
                        <span>👥 {r.club.memberCount} 人</span>
                        <span>⏱️ 每周 {r.club.weeklyHours} 小时</span>
                        <span>⭐ {r.club.rating}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
