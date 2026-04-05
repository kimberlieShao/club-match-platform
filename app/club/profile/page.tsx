'use client';

import { useState, useRef } from 'react';
import { mockClubs } from '@/lib/mockData';
import Navbar from '@/components/shared/Navbar';
import { useLanguage } from '@/lib/i18n';

const club = mockClubs[0];

const text = {
  zh: {
    title: '编辑社团主页',
    hint: '完善信息，提高在新生中的曝光率',
    basicInfo: '基本信息',
    clubName: '社团名称', description: '社团简介',
    weeklyHours: '每周活动时间', hours: '小时',
    tags: '社团标签', addTag: '+ 添加标签',
    announcement: '招新公告',
    socialMedia: '社交媒体',
    socialHint: '填写后将在社团详情页展示，方便新生关注',
    wechat: '微信公众号', xiaohongshu: '小红书主页',
    douyin: '抖音主页', weibo: '微博',
    saveBtn: '保存修改', savedBtn: '✓ 已保存',
    aiOriginal: '原内容', aiOptimized: 'AI 优化版',
    aiUse: '使用优化版', aiKeep: '保留原版',
    aiLoading: '生成中...', aiBtn: '✨ AI',
    empty: '（空）',
  },
  en: {
    title: 'Edit Club Profile',
    hint: 'Complete your profile to get discovered by more students',
    basicInfo: 'Basic Info',
    clubName: 'Club Name', description: 'About Us',
    weeklyHours: 'Weekly Time Commitment', hours: 'hrs',
    tags: 'Tags', addTag: '+ Add Tag',
    announcement: 'Recruitment Announcement',
    socialMedia: 'Find Us Online',
    socialHint: 'These will show on your club page so students can follow you',
    wechat: 'WeChat Official Account', xiaohongshu: 'Instagram',
    douyin: 'TikTok', weibo: 'Twitter/X',
    saveBtn: 'Save Changes', savedBtn: '✓ Saved',
    aiOriginal: 'Original', aiOptimized: 'AI Version',
    aiUse: 'Use AI Version', aiKeep: 'Keep Original',
    aiLoading: 'Generating...', aiBtn: '✨ AI',
    empty: '(empty)',
  },
};

type CopilotAction = '帮我写' | '帮我优化' | '帮我缩短' | '帮我扩写';

function buildCopilotPrompt(action: CopilotAction, current: string, context: string): string {
  switch (action) {
    case '帮我写':
      return `你是一个社团招新文案专家。${context}请帮我写一段内容，让它吸引新生，语言生动有感染力，100-150字以内。只返回文字，不要其他内容。`;
    case '帮我优化':
      return `你是一个社团招新文案专家。请优化以下内容，让它更吸引新生，语言生动有感染力，保留原有信息，100-150字以内。只返回优化后的文字。原内容：${current}`;
    case '帮我缩短':
      return `请把以下内容压缩到50字以内，保留最核心的信息。只返回压缩后的文字。原内容：${current}`;
    case '帮我扩写':
      return `请把以下内容扩展得更丰富详细，150-200字左右。只返回扩写后的文字。原内容：${current}`;
  }
}

interface AiCompareProps {
  original: string;
  result: string;
  onUse: () => void;
  onKeep: () => void;
  t: typeof text.zh;
}

function AiCompare({ original, result, onUse, onKeep, t }: AiCompareProps) {
  return (
    <div className="mt-3 border border-[#E5DEFF] rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-[#E5DEFF]">
        <div className="p-3">
          <p className="text-xs font-medium text-[#9B8EC4] mb-1.5">{t.aiOriginal}</p>
          <p className="text-xs text-[#4A4A6A] leading-relaxed">{original || t.empty}</p>
        </div>
        <div className="p-3 bg-[#F5F3FF]">
          <p className="text-xs font-medium text-[#534AB7] mb-1.5">{t.aiOptimized}</p>
          <p className="text-xs text-[#1A1240] leading-relaxed">{result}</p>
        </div>
      </div>
      <div className="flex border-t border-[#E5DEFF]">
        <button onClick={onUse} className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#534AB7] hover:bg-[#4338CA] transition-colors">
          {t.aiUse}
        </button>
        <button onClick={onKeep} className="flex-1 py-2.5 text-xs font-semibold text-[#6B5FA6] hover:bg-[#F0EEFF] transition-colors">
          {t.aiKeep}
        </button>
      </div>
    </div>
  );
}

interface CopilotMenuProps {
  show: boolean;
  loading: boolean;
  onToggle: () => void;
  onAction: (action: CopilotAction) => void;
  t: typeof text.zh;
}

function CopilotButton({ show, loading, onToggle, onAction, t }: CopilotMenuProps) {
  return (
    <div className="relative">
      <button onClick={onToggle} disabled={loading} className="text-xs px-2.5 py-1 rounded-lg bg-[#EDE9FF] text-[#534AB7] font-medium hover:bg-[#D4CEFF] transition-colors disabled:opacity-50">
        {loading ? t.aiLoading : t.aiBtn}
      </button>
      {show && (
        <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-[#E5DEFF] z-20 w-40 py-1">
          {(['帮我写', '帮我优化', '帮我缩短', '帮我扩写'] as CopilotAction[]).map((action) => (
            <button key={action} onClick={() => onAction(action)} className="w-full text-left px-4 py-2.5 text-sm text-[#1A1240] hover:bg-[#F5F3FF] transition-colors">
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClubProfilePage() {
  const { language } = useLanguage();
  const t = language === 'en' ? text.en : text.zh;

  const [name, setName] = useState(club.name);
  const [description, setDescription] = useState(club.description);
  const [weeklyHours, setWeeklyHours] = useState(club.weeklyHours);
  const [saved, setSaved] = useState(false);

  const [wechat, setWechat] = useState(club.socialMedia?.wechat ?? '');
  const [xiaohongshu, setXiaohongshu] = useState(club.socialMedia?.xiaohongshu ?? '');
  const [douyin, setDouyin] = useState(club.socialMedia?.douyin ?? '');
  const [weibo, setWeibo] = useState(club.socialMedia?.weibo ?? '');

  const [recruitNotice, setRecruitNotice] = useState(
    '我们正在招募热爱戏剧的新生！无论你是零基础还是有过表演经验，都欢迎来参加我们的面试。时间：9月15日-30日，地点：艺术楼302。'
  );

  const [descCopilotShow, setDescCopilotShow] = useState(false);
  const [descCopilotLoading, setDescCopilotLoading] = useState(false);
  const [descCompare, setDescCompare] = useState<{ original: string; result: string } | null>(null);

  const [recruitCopilotShow, setRecruitCopilotShow] = useState(false);
  const [recruitCopilotLoading, setRecruitCopilotLoading] = useState(false);
  const [recruitCompare, setRecruitCompare] = useState<{ original: string; result: string } | null>(null);

  void useRef; // kept for potential future use

  const anyMenuOpen = descCopilotShow || recruitCopilotShow;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const callCopilot = async (
    action: CopilotAction,
    current: string,
    context: string,
    setLoading: (v: boolean) => void,
    setShow: (v: boolean) => void,
    setCompare: (v: { original: string; result: string } | null) => void
  ) => {
    setShow(false);
    setLoading(true);
    setCompare(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: buildCopilotPrompt(action, current, context) }),
      });
      const data = await res.json();
      setCompare({ original: current, result: data.reply || '生成失败，请重试' });
    } catch {
      setCompare({ original: current, result: '生成失败，请重试' });
    }
    setLoading(false);
  };

  const clubContext = `社团名称：${name}，标签：${club.tags.join('、')}。`;

  const socialFields = [
    { key: 'wechat',       label: t.wechat,       value: wechat,       set: setWechat,       placeholder: '公众号名称，如：戏剧社官方', icon: '💬' },
    { key: 'xiaohongshu',  label: t.xiaohongshu,  value: xiaohongshu,  set: setXiaohongshu,  placeholder: '主页链接',                  icon: '📕' },
    { key: 'douyin',       label: t.douyin,        value: douyin,       set: setDouyin,        placeholder: '主页链接',                  icon: '🎵' },
    { key: 'weibo',        label: t.weibo,         value: weibo,        set: setWeibo,         placeholder: '主页链接',                  icon: '🐦' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar title={t.title} />

      <main className="flex-1 px-4 py-6">
        <p className="text-[#6B5FA6] text-sm mb-5">{t.hint}</p>

        <div className="flex flex-col gap-4">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-[#1A1240] mb-4">{t.basicInfo}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">{t.clubName}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7]"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#4A4A6A]">{t.description}</label>
                <CopilotButton
                  show={descCopilotShow}
                  loading={descCopilotLoading}
                  onToggle={() => { setDescCopilotShow((v) => !v); setRecruitCopilotShow(false); }}
                  onAction={(action) => callCopilot(action, description, clubContext, setDescCopilotLoading, setDescCopilotShow, setDescCompare)}
                  t={t}
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] resize-none"
              />
              {descCompare && (
                <AiCompare
                  original={descCompare.original}
                  result={descCompare.result}
                  onUse={() => { setDescription(descCompare.result); setDescCompare(null); }}
                  onKeep={() => setDescCompare(null)}
                  t={t}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">
                {t.weeklyHours}：<span className="text-[#534AB7] font-semibold">{weeklyHours} {t.hours}</span>
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full accent-[#534AB7]"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-semibold text-[#1A1240] mb-3">{t.tags}</h2>
            <div className="flex flex-wrap gap-2">
              {club.tags.map((tag) => (
                <span key={tag} className="bg-[#EDE9FF] text-[#534AB7] px-3 py-1.5 rounded-full text-sm font-medium">
                  {tag} ×
                </span>
              ))}
              <button className="px-3 py-1.5 rounded-full text-sm border-2 border-dashed border-[#C9C0F0] text-[#9B8EC4]">
                {t.addTag}
              </button>
            </div>
          </div>

          {/* Recruitment Notice */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1240]">{t.announcement}</h2>
              <CopilotButton
                show={recruitCopilotShow}
                loading={recruitCopilotLoading}
                onToggle={() => { setRecruitCopilotShow((v) => !v); setDescCopilotShow(false); }}
                onAction={(action) => callCopilot(action, recruitNotice, clubContext, setRecruitCopilotLoading, setRecruitCopilotShow, setRecruitCompare)}
                t={t}
              />
            </div>
            <textarea
              value={recruitNotice}
              onChange={(e) => setRecruitNotice(e.target.value)}
              rows={3}
              className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] resize-none text-sm"
            />
            {recruitCompare && (
              <AiCompare
                original={recruitCompare.original}
                result={recruitCompare.result}
                onUse={() => { setRecruitNotice(recruitCompare.result); setRecruitCompare(null); }}
                onKeep={() => setRecruitCompare(null)}
                t={t}
              />
            )}
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📱</span>
              <h2 className="font-semibold text-[#1A1240]">{t.socialMedia}</h2>
            </div>
            <p className="text-xs text-[#9B8EC4] mb-4">{t.socialHint}</p>
            <div className="flex flex-col gap-3">
              {socialFields.map(({ key, label, value, set, placeholder, icon }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5 flex items-center gap-1.5">
                    <span>{icon}</span> {label}
                  </label>
                  <input
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-semibold shadow-lg transition-all ${saved ? 'bg-green-500 text-white' : 'bg-[#534AB7] text-white'}`}
          >
            {saved ? t.savedBtn : t.saveBtn}
          </button>
        </div>
      </main>

      {anyMenuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => { setDescCopilotShow(false); setRecruitCopilotShow(false); }} />
      )}
    </div>
  );
}
