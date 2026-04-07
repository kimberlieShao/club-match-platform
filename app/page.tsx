'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import Navbar from '@/components/shared/Navbar';

const STAT_VALUES = ['52', '3,800+', '91%'];

const text = {
  zh: {
    badge: 'AI 驱动 · 真实评价',
    title1: '3 分钟',
    title2: '找到你的社团',
    subtitle: '告别信息差，通过 AI 匹配 + 真实成员评价，精准找到最适合你的社团',
    stat1: '入驻社团', stat2: '在校用户', stat3: '匹配满意率',
    student: '我是学生', studentSub: 'AI测评 · 精准匹配 · 真实评价',
    club: '我是社团负责人', clubSub: '数据看板 · AI写简介 · 招新管理',
    footer: '由 AI 驱动的校园社团匹配平台',
  },
  en: {
    badge: 'AI-Powered · Real Reviews',
    title1: 'Find Your People',
    title2: 'in 3 Minutes',
    subtitle: "Skip the club fair chaos. Get AI-matched to organizations you'll actually love.",
    stat1: 'Campus Orgs', stat2: 'Active Students', stat3: 'Match Rate',
    student: "I'm a Student", studentSub: 'Take the quiz · Get matched · Read real reviews',
    club: 'I Run a Club', clubSub: 'Analytics · AI copywriting · Member management',
    footer: 'AI-powered campus organization matching',
  },
};

export default function Home() {
  const { language } = useLanguage();
  const t = language === 'en' ? text.en : text.zh;

  const stats = [
    { value: STAT_VALUES[0], label: t.stat1 },
    { value: STAT_VALUES[1], label: t.stat2 },
    { value: STAT_VALUES[2], label: t.stat3 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col px-4">
      <Navbar title="" />
      {/* Top bar */}
      <div className="flex items-center justify-between pt-10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#534AB7] flex items-center justify-center shadow">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="font-bold text-[#1A1240] text-lg tracking-tight">ClubMatch</span>
        </div>
        <span className="text-xs text-[#9B8EC4] bg-white px-3 py-1 rounded-full border border-[#E5DEFF]">Beta</span>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
        <div className="mb-2">
          <span className="text-xs bg-[#534AB7]/10 text-[#534AB7] px-3 py-1 rounded-full font-medium">{t.badge}</span>
        </div>
        <h1 className="text-4xl font-bold text-[#1A1240] leading-tight mt-3 mb-2">
          {t.title1}<br />{t.title2}
        </h1>
        <p className="text-[#6B5FA6] text-sm max-w-xs leading-relaxed mb-8">
          {t.subtitle}
        </p>

        {/* Platform Stats */}
        <div className="flex gap-6 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[#534AB7] font-bold text-xl">{s.value}</p>
              <p className="text-[#9B8EC4] text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Entry Cards */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <Link href="/student/login">
            <div className="group bg-[#534AB7] hover:bg-[#4238A0] transition-all duration-200 rounded-2xl p-5 shadow-xl cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="text-left">
                  <h2 className="text-white text-lg font-semibold">{t.student}</h2>
                  <p className="text-purple-200 text-xs mt-0.5">{t.studentSub}</p>
                </div>
                <div className="ml-auto text-white/60 group-hover:translate-x-1 transition-transform text-xl">→</div>
              </div>
            </div>
          </Link>

          <Link href="/club/dashboard">
            <div className="group bg-white hover:bg-gray-50 transition-all duration-200 rounded-2xl p-5 shadow-md border border-[#E5DEFF] cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EDE9FF] flex items-center justify-center shrink-0">
                  <span className="text-2xl">🏛️</span>
                </div>
                <div className="text-left">
                  <h2 className="text-[#1A1240] text-lg font-semibold">{t.club}</h2>
                  <p className="text-[#6B5FA6] text-xs mt-0.5">{t.clubSub}</p>
                </div>
                <div className="ml-auto text-[#534AB7]/40 group-hover:translate-x-1 transition-transform text-xl">→</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-xs text-[#B8AEDC]">© 2026 ClubMatch · {t.footer}</p>
      </div>
    </main>
  );
}
