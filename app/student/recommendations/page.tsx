'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockClubs } from '@/lib/mockData';
import { matchClubs } from '@/lib/matchEngine';
import { MatchResult, QuizAnswers } from '@/lib/types';
import Navbar from '@/components/shared/Navbar';
import { useLanguage } from '@/lib/i18n';

const categoryColorStyle: Record<string, { background: string; color: string }> = {
  文艺: { background: '#FCE7F3', color: '#BE185D' },
  科技: { background: '#DBEAFE', color: '#1D4ED8' },
  体育: { background: '#D1FAE5', color: '#065F46' },
  学术: { background: '#FEF9C3', color: '#854D0E' },
  公益: { background: '#FFEDD5', color: '#9A3412' },
};

const categoryEn: Record<string, string> = {
  '文艺': 'Arts', '科技': 'Tech', '体育': 'Sports', '学术': 'Academic', '公益': 'Community',
};

const text = {
  zh: {
    title: '为你推荐的社团',
    subtitle: '根据你的个性和喜好，AI 为你精选以下社团',
    bestMatch: '最适合你',
    matchLabel: '匹配度',
    noResult: '没找到心仪的社团？',
    browseAll: '浏览全部社团 →',
    createClub: '申请创建社团 →',
  },
  en: {
    title: 'Your Matches',
    subtitle: "Based on your quiz, here are the orgs we think you'll love",
    bestMatch: 'Best Match',
    matchLabel: 'Match',
    noResult: 'Not seeing the right fit?',
    browseAll: 'Browse all orgs →',
    createClub: 'Start a new club →',
  },
};

export default function RecommendationsPage() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const router = useRouter();
  const { language } = useLanguage();
  const t = language === 'en' ? text.en : text.zh;

  useEffect(() => {
    const stored = localStorage.getItem('quizAnswers');
    if (stored) {
      const answers: QuizAnswers = JSON.parse(stored);
      setResults(matchClubs(answers, mockClubs));
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7FF' }}>
      <Navbar title={t.title} />
      <main style={{ padding: '16px 16px 40px' }}>
        <p style={{ fontSize: 14, color: '#6B5FA6', marginBottom: 20 }}>
          {t.subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {results.map((result, index) => {
            const isTop = index === 0;
            const catStyle = categoryColorStyle[result.club.category] ?? { background: '#F3F4F6', color: '#374151' };

            return (
              <Link key={result.club.id} href={`/student/club/${result.club.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '18px 16px',
                    border: isTop ? '2px solid #534AB7' : '1.5px solid #EDE9FF',
                    boxShadow: isTop ? '0 4px 20px rgba(83,74,183,0.12)' : '0 1px 4px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top badge */}
                  {isTop && (
                    <div
                      style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: '#fff',
                        fontSize: 11, fontWeight: 700,
                        padding: '4px 12px',
                        borderBottomLeftRadius: 12,
                        letterSpacing: 0.5,
                      }}
                    >
                      🏆 {t.bestMatch}
                    </div>
                  )}

                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingRight: isTop ? 80 : 0 }}>
                      <span style={{ fontSize: 14, color: '#9B8EC4' }}>#{index + 1}</span>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1240', margin: 0 }}>
                        {result.club.name}
                      </h2>
                      <span
                        style={{
                          fontSize: 12, padding: '2px 8px', borderRadius: 99, fontWeight: 500,
                          ...catStyle,
                        }}
                      >
                        {language === 'en' ? (categoryEn[result.club.category] ?? result.club.category) : result.club.category}
                      </span>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#534AB7', lineHeight: 1 }}>
                        {result.score}
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#9B8EC4' }}>%</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#9B8EC4', marginTop: 2 }}>{t.matchLabel}</div>
                    </div>
                  </div>

                  {/* AI reason */}
                  <div
                    style={{
                      background: '#F5F3FF',
                      borderRadius: 10,
                      padding: '10px 12px',
                      marginBottom: 12,
                      fontSize: 14,
                      color: '#3C3489',
                      lineHeight: 1.6,
                    }}
                  >
                    ✨ {language === 'en' ? result.reasonEn : result.reason}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {(language === 'en' ? (result.club.tagsEn ?? result.club.tags) : result.club.tags).slice(0, 4).map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 12, padding: '3px 10px', borderRadius: 99,
                          background: '#EDE9FF', color: '#534AB7',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9B8EC4' }}>
                    <span>👥 {result.club.memberCount}{language === 'en' ? ' members' : ' 人'}</span>
                    <span>⏱️ {language === 'en' ? `${result.club.weeklyHours}h/week` : `每周 ${result.club.weeklyHours} 小时`}</span>
                    <span>⭐ {result.club.rating}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            background: '#EEEDFE', borderRadius: 16, padding: 16,
            textAlign: 'center', marginTop: 20,
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: '#3C3489', marginBottom: 12 }}>
            {t.noResult}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/student/all-clubs')}
              style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                background: '#fff', color: '#534AB7',
                border: '1.5px solid #534AB7', cursor: 'pointer',
              }}
            >
              {t.browseAll}
            </button>
            <button
              onClick={() => router.push('/student/create-club')}
              style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                background: '#534AB7', color: '#fff',
                border: 'none', cursor: 'pointer',
              }}
            >
              {t.createClub}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
