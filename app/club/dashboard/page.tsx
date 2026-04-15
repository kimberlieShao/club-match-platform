'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { mockClubs } from '@/lib/mockData';
import Navbar from '@/components/shared/Navbar';
import { useLanguage } from '@/lib/i18n';

const ApplicationChart = dynamic(() => import('@/components/club/ApplicationChart'), { ssr: false });
const InterestChart    = dynamic(() => import('@/components/club/InterestChart'),    { ssr: false });
const ReadingChart     = dynamic(() => import('@/components/club/ReadingChart'),     { ssr: false });

const text = {
  zh: {
    title: '社团管理后台',
    welcome: '欢迎回来，', president: '社长：', editProfile: '编辑主页',
    totalApps: '总申请数', acceptRate: '录取率',
    avgMatch: '平均匹配度', pageViews: '页面访问量',
    thisSemester: '本学期', accepted: '人录取',
    fullScore: '满分100', last30days: '近30天',
    appsThisWeek: '近7天申请动态', clickToView: '点击数据点查看当日申请人',
    appList: '申请人列表', viewAll: '查看全部', applicants: '位申请者 →',
    interestThisWeek: '近7天感兴趣人数', profileViews: '点击详情页的用户数',
    wechatReach: '公众号文章阅读量', last5articles: '近5篇文章数据',
    pending: '待审核', accepted2: '已通过', declined: '已拒绝',
    viewDetail: '查看详情 →',
    showAll: '显示全部', noApps: '该天暂无申请记录',
    dayApplicants: (day: string, count: number) => `${day} 的申请（${count} 人）`,
    allRecent: (label: string) => `${label}（近7天）`,
  },
  en: {
    title: 'Club Dashboard',
    welcome: 'Welcome back, ', president: 'President: ', editProfile: 'Edit Profile',
    totalApps: 'Total Applications', acceptRate: 'Acceptance Rate',
    avgMatch: 'Avg Match Score', pageViews: 'Page Views',
    thisSemester: 'this semester', accepted: 'accepted',
    fullScore: 'out of 100', last30days: 'last 30 days',
    appsThisWeek: 'Applications This Week', clickToView: "Click a data point to see that day's applicants",
    appList: 'Applicants', viewAll: 'View all', applicants: 'applicants →',
    interestThisWeek: 'Profile Views This Week', profileViews: 'Students who viewed your page',
    wechatReach: 'Social Media Reach', last5articles: 'Last 5 posts',
    pending: 'Pending', accepted2: 'Accepted', declined: 'Declined',
    viewDetail: 'View Profile →',
    showAll: 'Show all', noApps: 'No applications for this day',
    dayApplicants: (day: string, count: number) => `${day} Applicants (${count})`,
    allRecent: (label: string) => `${label} (Last 7 Days)`,
  },
};

// ── Day data ──────────────────────────────────────────────────────────────────

const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayKey = typeof DAY_KEYS[number];

const DAY_ZH: Record<DayKey, string> = {
  Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日',
};
const APPLY_COUNTS: Record<DayKey, number> = {
  Mon: 2, Tue: 2, Wed: 2, Thu: 3, Fri: 2, Sat: 3, Sun: 2,
};

// ── Applicant mock data ───────────────────────────────────────────────────────

const DASH_APPLICANTS_RAW = [
  { id: '1',  nameZh: '刘雨欣', nameEn: 'Emma Liu',    tagsZh: ['表演', '舞台'],  tagsEn: ['Performance', 'Stage'],      status: '待审核', dayKey: 'Sat' as DayKey },
  { id: '2',  nameZh: '陈思远', nameEn: 'Alex Chen',   tagsZh: ['创作', '表演'],  tagsEn: ['Creation', 'Performance'],   status: '待审核', dayKey: 'Sat' as DayKey },
  { id: 'a1', nameZh: '沈晨曦', nameEn: 'Sophie Shen', tagsZh: ['剧本', '舞台'],  tagsEn: ['Script', 'Stage'],           status: '待审核', dayKey: 'Sat' as DayKey },
  { id: '3',  nameZh: '林晓雨', nameEn: 'Lily Lin',    tagsZh: ['剧本', '创意'],  tagsEn: ['Script', 'Creativity'],      status: '待审核', dayKey: 'Thu' as DayKey },
  { id: 'a2', nameZh: '唐如画', nameEn: 'Tara Tang',   tagsZh: ['表演', '音乐'],  tagsEn: ['Performance', 'Music'],      status: '待审核', dayKey: 'Thu' as DayKey },
  { id: 'a3', nameZh: '蒋思远', nameEn: 'Jason Jiang', tagsZh: ['创意', '表达'],  tagsEn: ['Creativity', 'Expression'],  status: '已通过', dayKey: 'Thu' as DayKey },
  { id: '7',  nameZh: '王天明', nameEn: 'Tom Wang',    tagsZh: ['运动', '团队'],  tagsEn: ['Sports', 'Teamwork'],        status: '待审核', dayKey: 'Sun' as DayKey },
  { id: 'a4', nameZh: '郑美丽', nameEn: 'Mia Zheng',   tagsZh: ['舞台', '创作'],  tagsEn: ['Stage', 'Creation'],         status: '待审核', dayKey: 'Sun' as DayKey },
  { id: '5',  nameZh: '李梦琪', nameEn: 'Chloe Li',    tagsZh: ['音乐', '表演'],  tagsEn: ['Music', 'Performance'],      status: '待审核', dayKey: 'Fri' as DayKey },
  { id: 'a5', nameZh: '马云汐', nameEn: 'Yara Ma',     tagsZh: ['表演', '剧本'],  tagsEn: ['Performance', 'Script'],     status: '已通过', dayKey: 'Fri' as DayKey },
  { id: '6',  nameZh: '张浩然', nameEn: 'Harry Zhang', tagsZh: ['编程', '创作'],  tagsEn: ['Coding', 'Creation'],        status: '已拒绝', dayKey: 'Tue' as DayKey },
  { id: 'a6', nameZh: '吴明远', nameEn: 'Owen Wu',     tagsZh: ['舞台', '表演'],  tagsEn: ['Stage', 'Performance'],      status: '待审核', dayKey: 'Tue' as DayKey },
  { id: '4',  nameZh: '赵子轩', nameEn: 'Zack Zhao',   tagsZh: ['表演', '学术'],  tagsEn: ['Performance', 'Academic'],   status: '已通过', dayKey: 'Wed' as DayKey },
  { id: 'a7', nameZh: '周晓涵', nameEn: 'Hana Zhou',   tagsZh: ['剧本', '创意'],  tagsEn: ['Script', 'Creativity'],      status: '待审核', dayKey: 'Wed' as DayKey },
  { id: 'a8', nameZh: '韩冰晴', nameEn: 'Clara Han',   tagsZh: ['创作', '表达'],  tagsEn: ['Creation', 'Expression'],    status: '待审核', dayKey: 'Mon' as DayKey },
  { id: 'a9', nameZh: '孟思琪', nameEn: 'Quinn Meng',  tagsZh: ['表演', '舞台'],  tagsEn: ['Performance', 'Stage'],      status: '待审核', dayKey: 'Mon' as DayKey },
];

const STATUS_CHIP_ZH: Record<string, string> = {
  待审核: 'bg-yellow-100 text-yellow-700',
  已通过: 'bg-green-100 text-green-700',
  已拒绝: 'bg-red-100 text-red-700',
};

const club = mockClubs[0];

export default function DashboardPage() {
  const { language } = useLanguage();
  const t    = language === 'en' ? text.en : text.zh;
  const isEn = language === 'en';

  // Language-aware day label helper
  const dayLabel = (key: DayKey) => isEn ? key : DAY_ZH[key];

  // Chart data with language-aware x-axis labels
  const applyData = useMemo(() =>
    DAY_KEYS.map((k) => ({ day: dayLabel(k), count: APPLY_COUNTS[k] })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [language]);

  // Applicants with language-aware fields; appliedDate = display label for current language
  const dashApplicants = useMemo(() =>
    DASH_APPLICANTS_RAW.map((a) => ({
      ...a,
      name:        isEn ? a.nameEn : a.nameZh,
      tags:        isEn ? a.tagsEn : a.tagsZh,
      appliedDate: dayLabel(a.dayKey),
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [language]);

  // Status display mapping
  const statusDisplay = (status: string) => {
    if (status === '待审核') return t.pending;
    if (status === '已通过') return t.accepted2;
    if (status === '已拒绝') return t.declined;
    return status;
  };

  // selectedDay stores the current-language display label (e.g. 'Sat' or '周六')
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleChartClick = (data: { activeLabel?: string } | null) => {
    if (!data?.activeLabel) return;
    setSelectedDay((prev) => (prev === data.activeLabel ? null : data.activeLabel!));
  };

  const filtered = selectedDay
    ? dashApplicants.filter((a) => a.appliedDate === selectedDay)
    : dashApplicants;

  const selectedCount = applyData.find((d) => d.day === selectedDay)?.count ?? filtered.length;

  const listTitle = selectedDay
    ? t.dayApplicants(selectedDay, selectedCount)
    : t.allRecent(t.appList);

  const summaryStats = [
    { label: t.totalApps,  value: '42',    icon: '📨', sub: t.thisSemester },
    { label: t.acceptRate, value: '67%',   icon: '✅', sub: isEn ? `28 ${t.accepted}` : `28${t.accepted}` },
    { label: t.avgMatch,   value: '78',    icon: '🎯', sub: t.fullScore },
    { label: t.pageViews,  value: '1,234', icon: '👁️', sub: t.last30days },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar title={t.title} />

      <main className="flex-1 px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#6B5FA6] text-sm">
              {t.welcome}{isEn ? (club.nameEn ?? club.name) : club.name}
            </p>
            {club.president && (
              <p className="text-xs text-[#9B8EC4] mt-0.5">
                {t.president}{isEn ? (club.presidentEn ?? club.president) : club.president}
              </p>
            )}
          </div>
          <Link href="/club/profile">
            <button className="px-4 py-2 bg-[#534AB7] text-white text-sm font-medium rounded-xl">
              {t.editProfile}
            </button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-xs text-[#9B8EC4]">{stat.label}</span>
              </div>
              <p className="text-[#534AB7] font-bold text-2xl">{stat.value}</p>
              <p className="text-[#9B8EC4] text-xs mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + applicant list */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="font-semibold text-[#1A1240]">{t.appsThisWeek}</h2>
            <Link href="/club/applications" className="text-xs text-[#534AB7] font-semibold">
              {t.viewAll} →
            </Link>
          </div>
          <p className="text-xs text-[#9B8EC4] mb-4">{t.clickToView}</p>

          <ApplicationChart
            data={applyData}
            selectedDay={selectedDay}
            onDayClick={handleChartClick}
            language={language}
          />

          <div className="border-t border-[#F0EEFF] my-4" />

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#1A1240] text-sm">{listTitle}</h3>
            {selectedDay && (
              <button
                onClick={() => setSelectedDay(null)}
                className="text-xs text-[#9B8EC4] border border-[#DDD8FF] px-2 py-0.5 rounded-full"
              >
                {t.showAll}
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-[#9B8EC4] text-center py-4">{t.noApps}</p>
          ) : (
            <div className="flex flex-col">
              {filtered.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b border-[#F0EEFF] last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-[#1A1240] text-sm">{app.name}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_CHIP_ZH[app.status]}`}>
                        {statusDisplay(app.status)}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-0.5">
                      {app.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs bg-[#EDE9FF] text-[#534AB7] px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="text-[#C4BAEC] text-xs">{app.appliedDate}</span>
                    <Link
                      href="/club/applications"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          sessionStorage.setItem('highlightApp', app.id);
                        }
                      }}
                      className="text-xs text-[#534AB7] font-semibold whitespace-nowrap"
                    >
                      {t.viewDetail}
                    </Link>
                  </div>
                </div>
              ))}
              {filtered.length > 3 && (
                <Link
                  href="/club/applications"
                  className="mt-3 block text-center text-sm text-[#534AB7] font-medium border py-2 rounded-lg"
                  style={{ borderColor: '#534AB7', borderWidth: '0.5px' }}
                >
                  {t.viewAll} {filtered.length} {t.applicants}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Interests chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="font-semibold text-[#1A1240] mb-1">{t.interestThisWeek}</h2>
          <p className="text-xs text-[#9B8EC4] mb-4">{t.profileViews}</p>
          <InterestChart />
        </div>

        {/* Articles chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="font-semibold text-[#1A1240] mb-1">{t.wechatReach}</h2>
          <p className="text-xs text-[#9B8EC4] mb-4">{t.last5articles}</p>
          <ReadingChart />
        </div>
      </main>
    </div>
  );
}
