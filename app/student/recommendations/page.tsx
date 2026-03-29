'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockClubs } from '@/lib/mockData';
import { matchClubs } from '@/lib/matchEngine';
import { MatchResult, QuizAnswers } from '@/lib/types';
import Navbar from '@/components/shared/Navbar';

const categoryColors: Record<string, string> = {
  文艺: 'bg-pink-100 text-pink-700',
  科技: 'bg-blue-100 text-blue-700',
  体育: 'bg-green-100 text-green-700',
  学术: 'bg-yellow-100 text-yellow-700',
  公益: 'bg-orange-100 text-orange-700',
};

const categoryColorStyle: Record<string, { background: string; color: string }> = {
  文艺: { background: '#FCE7F3', color: '#BE185D' },
  科技: { background: '#DBEAFE', color: '#1D4ED8' },
  体育: { background: '#D1FAE5', color: '#065F46' },
  学术: { background: '#FEF9C3', color: '#854D0E' },
  公益: { background: '#FFEDD5', color: '#9A3412' },
};

export default function RecommendationsPage() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('quizAnswers');
    if (stored) {
      const answers: QuizAnswers = JSON.parse(stored);
      setResults(matchClubs(answers, mockClubs));
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7FF' }}>
      <Navbar title="为你推荐的社团" />
      <main style={{ padding: '16px 16px 40px' }}>
        <p style={{ fontSize: 14, color: '#6B5FA6', marginBottom: 20 }}>
          根据你的个性和喜好，AI 为你精选以下社团
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
                      🏆 最适合你
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
                        {result.club.category}
                      </span>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#534AB7', lineHeight: 1 }}>
                        {result.score}
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#9B8EC4' }}>%</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#9B8EC4', marginTop: 2 }}>匹配度</div>
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
                    ✨ {result.reason}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {result.club.tags.slice(0, 4).map((tag, i) => (
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
                    <span>👥 {result.club.memberCount} 人</span>
                    <span>⏱️ 每周 {result.club.weeklyHours} 小时</span>
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
            没找到心仪的社团？
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
              浏览全部社团 →
            </button>
            <button
              onClick={() => router.push('/student/create-club')}
              style={{
                padding: '10px 18px', borderRadius: 12, fontSize: 14, fontWeight: 500,
                background: '#534AB7', color: '#fff',
                border: 'none', cursor: 'pointer',
              }}
            >
              申请创建社团 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
