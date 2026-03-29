'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { mockClubs } from '@/lib/mockData';
import Navbar from '@/components/shared/Navbar';

const ApplicationChart = dynamic(() => import('@/components/club/ApplicationChart'), { ssr: false });
const InterestChart = dynamic(() => import('@/components/club/InterestChart'), { ssr: false });
const ReadingChart = dynamic(() => import('@/components/club/ReadingChart'), { ssr: false });

const club = mockClubs[0];

const applyData = [
  { day: '周一', count: 2 },
  { day: '周二', count: 2 },
  { day: '周三', count: 2 },
  { day: '周四', count: 3 },
  { day: '周五', count: 2 },
  { day: '周六', count: 3 },
  { day: '周日', count: 2 },
];


const summaryStats = [
  { label: '总申请数', value: '42', icon: '📨', sub: '本学期' },
  { label: '录取率', value: '67%', icon: '✅', sub: '28人录取' },
  { label: '平均匹配度', value: '78', icon: '🎯', sub: '满分100' },
  { label: '页面访问量', value: '1,234', icon: '👁️', sub: '近30天' },
];

// ─── Mock applicants with appliedDate ────────────────────────────────────────

const DASH_APPLICANTS = [
  { id: '1',  name: '刘雨欣', tags: ['表演', '舞台'],   status: '待审核', appliedDate: '周六' },
  { id: '2',  name: '陈思远', tags: ['创作', '表演'],   status: '待审核', appliedDate: '周六' },
  { id: 'a1', name: '沈晨曦', tags: ['剧本', '舞台'],   status: '待审核', appliedDate: '周六' },
  { id: '3',  name: '林晓雨', tags: ['剧本', '创意'],   status: '待审核', appliedDate: '周四' },
  { id: 'a2', name: '唐如画', tags: ['表演', '音乐'],   status: '待审核', appliedDate: '周四' },
  { id: 'a3', name: '蒋思远', tags: ['创意', '表达'],   status: '已通过', appliedDate: '周四' },
  { id: '7',  name: '王天明', tags: ['运动', '团队'],   status: '待审核', appliedDate: '周日' },
  { id: 'a4', name: '郑美丽', tags: ['舞台', '创作'],   status: '待审核', appliedDate: '周日' },
  { id: '5',  name: '李梦琪', tags: ['音乐', '表演'],   status: '待审核', appliedDate: '周五' },
  { id: 'a5', name: '马云汐', tags: ['表演', '剧本'],   status: '已通过', appliedDate: '周五' },
  { id: '6',  name: '张浩然', tags: ['编程', '创作'],   status: '已拒绝', appliedDate: '周二' },
  { id: 'a6', name: '吴明远', tags: ['舞台', '表演'],   status: '待审核', appliedDate: '周二' },
  { id: '4',  name: '赵子轩', tags: ['表演', '学术'],   status: '已通过', appliedDate: '周三' },
  { id: 'a7', name: '周晓涵', tags: ['剧本', '创意'],   status: '待审核', appliedDate: '周三' },
  { id: 'a8', name: '韩冰晴', tags: ['创作', '表达'],   status: '待审核', appliedDate: '周一' },
  { id: 'a9', name: '孟思琪', tags: ['表演', '舞台'],   status: '待审核', appliedDate: '周一' },
];

const STATUS_CHIP: Record<string, string> = {
  待审核: 'bg-yellow-100 text-yellow-700',
  已通过: 'bg-green-100 text-green-700',
  已拒绝: 'bg-red-100 text-red-700',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleChartClick = (data: { activeLabel?: string } | null) => {
    if (!data?.activeLabel) return;
    setSelectedDay((prev) => (prev === data.activeLabel ? null : data.activeLabel!));
  };

  const filtered = selectedDay
    ? DASH_APPLICANTS.filter((a) => a.appliedDate === selectedDay)
    : DASH_APPLICANTS;

  const listTitle = selectedDay
    ? `${selectedDay} 的申请（${applyData.find((d) => d.day === selectedDay)?.count ?? filtered.length} 人）`
    : `申请人列表（近7天）`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar title="社团管理后台" />

      <main className="flex-1 px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#6B5FA6] text-sm">欢迎回来，{club.name}</p>
            {club.president && (
              <p className="text-xs text-[#9B8EC4] mt-0.5">社长：{club.president}</p>
            )}
          </div>
          <Link href="/club/profile">
            <button className="px-4 py-2 bg-[#534AB7] text-white text-sm font-medium rounded-xl">
              编辑主页
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

        {/* ── Merged: chart + applicant list ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="font-semibold text-[#1A1240]">近7天申请动态</h2>
            <Link href="/club/applications" className="text-xs text-[#534AB7] font-semibold">
              查看全部 →
            </Link>
          </div>
          <p className="text-xs text-[#9B8EC4] mb-4">点击数据点查看当日申请人</p>

          {/* Chart */}
          <ApplicationChart
            data={applyData}
            selectedDay={selectedDay}
            onDayClick={handleChartClick}
          />

          {/* Divider */}
          <div className="border-t border-[#F0EEFF] my-4" />

          {/* List header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[#1A1240] text-sm">{listTitle}</h3>
            </div>
            {selectedDay && (
              <button
                onClick={() => setSelectedDay(null)}
                className="text-xs text-[#9B8EC4] border border-[#DDD8FF] px-2 py-0.5 rounded-full"
              >
                显示全部
              </button>
            )}
          </div>

          {/* Applicant rows */}
          {filtered.length === 0 ? (
            <p className="text-sm text-[#9B8EC4] text-center py-4">该天暂无申请记录</p>
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
                      <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_CHIP[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-0.5">
                      {app.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-xs bg-[#EDE9FF] text-[#534AB7] px-1.5 py-0.5 rounded">
                          {t}
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
                      查看详情 →
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
                  {selectedDay
                    ? `查看当天全部 ${filtered.length} 位申请者 →`
                    : `查看全部 ${filtered.length} 位申请者 →`}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Interests chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="font-semibold text-[#1A1240] mb-1">近7天感兴趣人数</h2>
          <p className="text-xs text-[#9B8EC4] mb-4">点击详情页的用户数</p>
          <InterestChart />
        </div>

        {/* Articles chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="font-semibold text-[#1A1240] mb-1">公众号文章阅读量</h2>
          <p className="text-xs text-[#9B8EC4] mb-4">近5篇文章数据</p>
          <ReadingChart />
        </div>
      </main>
    </div>
  );
}
