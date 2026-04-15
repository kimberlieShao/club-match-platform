'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/Navbar';
import { useLanguage } from '@/lib/i18n';

interface Application {
  clubName: string;
  clubNameEn?: string;
  clubId: string;
  appliedAt: string;
  status: '待审核' | '已通过' | '已拒绝';
  reason?: string;
  mbti?: string;
  zodiac?: string;
  aiSummary?: string;
}

// Internal tab values stay Chinese to match app.status
const STATUS_TABS = ['全部', '待审核', '已通过', '已拒绝'] as const;
type Tab = typeof STATUS_TABS[number];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  待审核: { bg: '#FFF3CD', color: '#A07820' },
  已通过: { bg: '#D6F5E3', color: '#3A8A5A' },
  已拒绝: { bg: '#FFD6E0', color: '#C2506A' },
};

const DOT_COLOR: Record<string, string> = {
  待审核: '#C0BDD8',
  已通过: '#3A8A5A',
  已拒绝: '#C2506A',
};

const text = {
  zh: {
    title: '我的申请',
    all: '全部', pending: '待审核', accepted: '已通过', declined: '已拒绝',
    pendingBadge: '待审核', acceptedBadge: '已通过', declinedBadge: '已拒绝',
    replyTime: '预计3个工作日内回复',
    viewDetail: '查看详情', withdraw: '撤回申请',
    confirmWithdraw: '确认撤回对',
    confirmWithdraw2: '的申请？撤回后不可恢复',
    confirm: '确认撤回', cancel: '取消',
    empty: '还没有申请记录，去发现社团吧',
    emptyFiltered: '暂无此状态的申请',
    emptyBtn: '去看看 →',
    appliedAt: '提交申请',
    viewClub: '查看社团 →',
    collapse: '收起 ▲', expand: '查看详情 ▼',
    detailTime: '申请时间', detailReason: '申请理由', detailTags: '个人标签', detailAI: 'AI 总结',
  },
  en: {
    title: 'My Applications',
    all: 'All', pending: 'Pending', accepted: 'Accepted', declined: 'Declined',
    pendingBadge: 'Pending', acceptedBadge: 'Accepted', declinedBadge: 'Declined',
    replyTime: 'Usually hear back within 3 business days',
    viewDetail: 'View Details', withdraw: 'Withdraw',
    confirmWithdraw: 'Withdraw your application to',
    confirmWithdraw2: '? This cannot be undone.',
    confirm: 'Confirm', cancel: 'Cancel',
    empty: "No applications yet — go find your club!",
    emptyFiltered: 'No applications with this status',
    emptyBtn: 'Explore clubs →',
    appliedAt: 'Applied',
    viewClub: 'View Club →',
    collapse: 'Collapse ▲', expand: 'View Details ▼',
    detailTime: 'Applied At', detailReason: 'Reason', detailTags: 'Tags', detailAI: 'AI Summary',
  },
};

function formatDateTime(iso: string, lang: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (lang === 'en') {
    return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function appKey(app: Application) {
  return `${app.clubId}-${app.appliedAt}`;
}

export default function MyApplicationsPage() {
  const { language } = useLanguage();
  const t = language === 'en' ? text.en : text.zh;

  const [apps, setApps] = useState<Application[]>([]);
  const [tab, setTab] = useState<Tab>('全部');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('myApplications');
    if (raw) setApps(JSON.parse(raw));
  }, []);

  const filtered = tab === '全部' ? apps : apps.filter((a) => a.status === tab);

  // Maps internal Chinese status → localized display label
  const statusLabel: Record<string, string> = {
    '待审核': t.pendingBadge,
    '已通过': t.acceptedBadge,
    '已拒绝': t.declinedBadge,
  };

  // Tab display labels in order matching STATUS_TABS
  const tabLabels = [t.all, t.pending, t.accepted, t.declined];

  const handleWithdraw = (key: string) => {
    const updated = apps.filter((a) => appKey(a) !== key);
    localStorage.setItem('myApplications', JSON.stringify(updated));
    setApps(updated);
    setConfirmKey(null);
    setExpandedKey(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar title={t.title} />

      <main className="flex-1 px-4 py-6">
        {/* Status tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tabValue, i) => (
            <button
              key={tabValue}
              onClick={() => setTab(tabValue)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === tabValue
                  ? 'bg-[#534AB7] text-white'
                  : 'bg-white text-[#9B8EC4] border border-[#E5DEFF]'
              }`}
            >
              {tabLabels[i]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-[#6B5FA6] font-medium mb-1">
              {tab === '全部' ? t.empty : t.emptyFiltered}
            </p>
            {tab === '全部' && (
              <Link
                href="/student/recommendations"
                className="mt-5 px-6 py-2.5 bg-[#534AB7] text-white rounded-xl font-medium text-sm"
              >
                {t.emptyBtn}
              </Link>
            )}
          </div>
        ) : (
          <div className="relative pl-6">
            {/* Timeline vertical line */}
            <div className="absolute left-[9px] top-3 bottom-3 w-px bg-[#E5DEFF]" />
            <div className="flex flex-col gap-4">
              {filtered.map((app) => {
                const key = appKey(app);
                const style = STATUS_STYLE[app.status] ?? { bg: '#F5F3FF', color: '#534AB7' };
                const dotColor = DOT_COLOR[app.status] ?? '#C0BDD8';
                const isExpanded = expandedKey === key;
                const isConfirming = confirmKey === key;

                return (
                  <div key={key} className="relative">
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-[22px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white"
                      style={{ background: dotColor }}
                    />
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      {/* Card main */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-[#1A1240] text-base">{language === 'en' ? (app.clubNameEn ?? app.clubName) : app.clubName}</p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {statusLabel[app.status] ?? app.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#9B8EC4] mb-2">{formatDateTime(app.appliedAt, language)} {t.appliedAt}</p>
                        {app.status === '待审核' && !isConfirming && (
                          <p className="text-xs text-[#C0B8E0] mb-2">{t.replyTime}</p>
                        )}
                        {app.status === '已通过' && (
                          <Link href={`/student/club/${app.clubId}`} className="text-xs text-[#534AB7] font-semibold block mb-2">
                            {t.viewClub}
                          </Link>
                        )}

                        {/* Inline withdraw confirmation */}
                        {isConfirming && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
                            <p className="text-sm text-red-700 mb-3">
                              {t.confirmWithdraw} <strong>{language === 'en' ? (app.clubNameEn ?? app.clubName) : app.clubName}</strong>{t.confirmWithdraw2}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleWithdraw(key)}
                                className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium"
                              >
                                {t.confirm}
                              </button>
                              <button
                                onClick={() => setConfirmKey(null)}
                                className="flex-1 py-1.5 bg-white border border-[#E5DEFF] text-[#6B5FA6] rounded-lg text-sm"
                              >
                                {t.cancel}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setExpandedKey(isExpanded ? null : key)}
                            className="text-xs text-[#534AB7] font-medium"
                          >
                            {isExpanded ? t.collapse : t.expand}
                          </button>
                          {app.status === '待审核' && !isConfirming && (
                            <button
                              onClick={() => setConfirmKey(key)}
                              className="text-xs text-red-400 font-medium"
                            >
                              {t.withdraw}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Accordion detail */}
                      {isExpanded && (
                        <div className="border-t border-[#F0EEFF] px-4 py-3 bg-[#FAFAFF] flex flex-col gap-2.5">
                          <div className="flex gap-2">
                            <span className="text-xs text-[#9B8EC4] w-16 shrink-0">{t.detailTime}</span>
                            <span className="text-xs text-[#1A1240]">{formatDateTime(app.appliedAt, language)}</span>
                          </div>
                          {app.reason ? (
                            <div className="flex gap-2">
                              <span className="text-xs text-[#9B8EC4] w-16 shrink-0">{t.detailReason}</span>
                              <span className="text-xs text-[#1A1240] leading-relaxed">{app.reason}</span>
                            </div>
                          ) : null}
                          {(app.mbti || app.zodiac) && (
                            <div className="flex gap-2">
                              <span className="text-xs text-[#9B8EC4] w-16 shrink-0">{t.detailTags}</span>
                              <div className="flex gap-1.5 flex-wrap">
                                {app.mbti && (
                                  <span className="text-xs bg-[#EDE9FF] text-[#534AB7] px-2 py-0.5 rounded-full">{app.mbti}</span>
                                )}
                                {app.zodiac && (
                                  <span className="text-xs bg-[#EDE9FF] text-[#534AB7] px-2 py-0.5 rounded-full">{app.zodiac}</span>
                                )}
                              </div>
                            </div>
                          )}
                          {app.aiSummary ? (
                            <div className="flex gap-2">
                              <span className="text-xs text-[#9B8EC4] w-16 shrink-0 flex items-start gap-1">
                                {t.detailAI}
                                <span className="bg-[#534AB7] text-white text-[10px] px-1 py-0.5 rounded font-medium leading-none">AI</span>
                              </span>
                              <span className="text-xs text-[#1A1240] leading-relaxed">{app.aiSummary}</span>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
