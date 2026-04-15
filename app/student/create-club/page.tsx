'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';
import { useLanguage } from '@/lib/i18n';

const CLUB_TYPES_ZH = ['文艺', '体育', '学术', '公益', '科技'] as const;
const CLUB_TYPES_EN = ['Arts',  'Sports', 'Academic', 'Community', 'Tech'] as const;

type CopilotAction = 'write' | 'improve' | 'shorten' | 'expand';

const text = {
  zh: {
    navTitle: '申请创建社团',
    subtitle: '填写基本信息，提交后等待学校审核',
    clubNameLabel: '社团名称 *',
    clubNamePlaceholder: '请输入社团名称',
    clubTypeLabel: '社团类型 *',
    descLabel: '社团简介 *',
    descPlaceholder: '介绍你想创建的社团，包括目标、活动形式等',
    memberCountLabel: '预计招募人数 *',
    submitBtn: '提交申请',
    aiGenerating: '生成中...',
    aiEmpty: '（空）',
    aiOriginal: '原简介',
    aiOptimized: 'AI 优化版',
    aiApply: '使用优化版',
    aiKeep: '保留原版',
    aiFailed: '生成失败，请重试',
    successTitle: '申请已提交',
    successBody: '等待学校审核，通常需要3-5个工作日。\n审核结果将通过站内消息通知你。',
    copilotActions: {
      write: '帮我写', improve: '帮我优化', shorten: '帮我缩短', expand: '帮我扩写',
    } as Record<CopilotAction, string>,
    promptFns: {
      write:   (name: string, type: string) =>
        `你是一个社团招新文案专家。${name ? `社团名称：${name}，类型：${type}。` : ''}请帮我写一段社团简介，让它吸引新生，语言生动有感染力，100-150字以内。只返回简介文字，不要其他内容。`,
      improve: (name: string, type: string, desc: string) =>
        `你是一个社团招新文案专家。请优化以下社团简介，让它更吸引新生，语言生动有感染力，保留原有信息，100-150字以内。只返回优化后的文字。原简介：${desc}`,
      shorten: (_n: string, _t: string, desc: string) =>
        `请把以下社团简介压缩到50字以内，保留最核心的信息。只返回压缩后的文字。原简介：${desc}`,
      expand:  (_n: string, _t: string, desc: string) =>
        `请把以下社团简介扩展得更丰富详细，150-200字左右，突出社团特色和对新生的吸引力。只返回扩写后的文字。原简介：${desc}`,
    } as Record<CopilotAction, (name: string, type: string, desc: string) => string>,
  },
  en: {
    navTitle: 'Start a Club',
    subtitle: 'Fill in the basics and submit for school review',
    clubNameLabel: 'Club Name *',
    clubNamePlaceholder: 'Enter club name',
    clubTypeLabel: 'Club Type *',
    descLabel: 'Description *',
    descPlaceholder: 'Tell us about your club — goals, activities, and what makes it unique',
    memberCountLabel: 'Expected Members *',
    submitBtn: 'Submit Application',
    aiGenerating: 'Generating...',
    aiEmpty: '(empty)',
    aiOriginal: 'Original',
    aiOptimized: 'AI Version',
    aiApply: 'Use AI Version',
    aiKeep: 'Keep Original',
    aiFailed: 'Generation failed, please try again',
    successTitle: 'Application Submitted!',
    successBody: 'Your application is under review. Usually takes 3–5 business days.\nWe\'ll notify you in-app when a decision is made.',
    copilotActions: {
      write: 'Write for me', improve: 'Improve', shorten: 'Shorten', expand: 'Expand',
    } as Record<CopilotAction, string>,
    promptFns: {
      write:   (name: string, type: string) =>
        `You are a club recruitment copywriter. ${name ? `Club name: ${name}, type: ${type}.` : ''} Write a compelling club description to attract new members. Keep it vivid and engaging, 100–150 words. Return only the description text.`,
      improve: (_n: string, _t: string, desc: string) =>
        `You are a club recruitment copywriter. Improve the following club description to be more compelling to new members. Keep the original info, 100–150 words. Return only the improved text. Original: ${desc}`,
      shorten: (_n: string, _t: string, desc: string) =>
        `Compress the following club description to under 50 words, keeping only the most essential info. Return only the compressed text. Original: ${desc}`,
      expand:  (_n: string, _t: string, desc: string) =>
        `Expand the following club description to be richer and more detailed, about 150–200 words, highlighting the club's unique character. Return only the expanded text. Original: ${desc}`,
    } as Record<CopilotAction, (name: string, type: string, desc: string) => string>,
  },
};

export default function CreateClubPage() {
  const { language } = useLanguage();
  const t    = language === 'en' ? text.en : text.zh;
  const isEn = language === 'en';

  const clubTypes    = CLUB_TYPES_ZH;          // internal values stay ZH (stored/typed as ZH)
  const clubTypeLabels = isEn ? CLUB_TYPES_EN : CLUB_TYPES_ZH;

  const [clubName,    setClubName]    = useState('');
  const [clubType,    setClubType]    = useState('');
  const [description, setDescription] = useState('');
  const [memberCount, setMemberCount] = useState('');
  const [submitted,   setSubmitted]   = useState(false);

  const [showCopilot,     setShowCopilot]     = useState(false);
  const [copilotLoading,  setCopilotLoading]  = useState(false);
  const [copilotResult,   setCopilotResult]   = useState('');
  const [copilotOriginal, setCopilotOriginal] = useState('');
  const [showCompare,     setShowCompare]     = useState(false);

  const handleSubmit = () => {
    if (!clubName.trim() || !clubType || !description.trim() || !memberCount) return;
    setSubmitted(true);
  };

  const handleCopilotAction = async (action: CopilotAction) => {
    if (action !== 'write' && !description.trim()) return;
    setShowCopilot(false);
    setCopilotLoading(true);
    setCopilotResult('');
    setCopilotOriginal(description);
    setShowCompare(false);
    try {
      const prompt = t.promptFns[action](clubName, clubType, description);
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      setCopilotResult(data.reply || t.aiFailed);
      setShowCompare(true);
    } catch {
      setCopilotResult(t.aiFailed);
      setShowCompare(true);
    }
    setCopilotLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
        <Navbar titleZh="申请创建社团" titleEn="Start a Club" />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="text-xl font-bold text-[#1A1240] mb-2">{t.successTitle}</h2>
          <p className="text-[#6B5FA6] text-center text-sm leading-relaxed">
            {t.successBody.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar titleZh="申请创建社团" titleEn="Start a Club" />

      <main className="flex-1 px-4 py-6">
        <p className="text-[#6B5FA6] text-sm mb-5">{t.subtitle}</p>

        <div className="flex flex-col gap-4">
          {/* Club Name */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">{t.clubNameLabel}</label>
            <input
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder={t.clubNamePlaceholder}
              className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] text-sm"
            />
          </div>

          {/* Club Type */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-[#4A4A6A] mb-3">{t.clubTypeLabel}</label>
            <div className="flex flex-wrap gap-2">
              {clubTypes.map((type, i) => (
                <button
                  key={type}
                  onClick={() => setClubType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    clubType === type
                      ? 'bg-[#534AB7] text-white'
                      : 'bg-[#F5F3FF] text-[#6B5FA6] border border-[#E5DEFF]'
                  }`}
                >
                  {clubTypeLabels[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Description with AI Copilot */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#4A4A6A]">{t.descLabel}</label>
              <div className="relative">
                <button
                  onClick={() => setShowCopilot((v) => !v)}
                  disabled={copilotLoading}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#EDE9FF] text-[#534AB7] font-medium hover:bg-[#D4CEFF] transition-colors disabled:opacity-50"
                >
                  {copilotLoading ? t.aiGenerating : '✨ AI'}
                </button>
                {showCopilot && (
                  <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-[#E5DEFF] z-20 w-44 py-1">
                    {(['write', 'improve', 'shorten', 'expand'] as CopilotAction[]).map((action) => (
                      <button
                        key={action}
                        onClick={() => handleCopilotAction(action)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#1A1240] hover:bg-[#F5F3FF] transition-colors"
                      >
                        {t.copilotActions[action]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder={t.descPlaceholder}
              className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] resize-none text-sm"
            />

            {/* AI Compare block */}
            {showCompare && (
              <div className="mt-3 border border-[#E5DEFF] rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-[#E5DEFF]">
                  <div className="p-3">
                    <p className="text-xs font-medium text-[#9B8EC4] mb-1.5">{t.aiOriginal}</p>
                    <p className="text-xs text-[#4A4A6A] leading-relaxed">{copilotOriginal || t.aiEmpty}</p>
                  </div>
                  <div className="p-3 bg-[#F5F3FF]">
                    <p className="text-xs font-medium text-[#534AB7] mb-1.5">{t.aiOptimized}</p>
                    <p className="text-xs text-[#1A1240] leading-relaxed">{copilotResult}</p>
                  </div>
                </div>
                <div className="flex border-t border-[#E5DEFF]">
                  <button
                    onClick={() => { setDescription(copilotResult); setShowCompare(false); }}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#534AB7] hover:bg-[#4338CA] transition-colors"
                  >
                    {t.aiApply}
                  </button>
                  <button
                    onClick={() => setShowCompare(false)}
                    className="flex-1 py-2.5 text-xs font-semibold text-[#6B5FA6] hover:bg-[#F0EEFF] transition-colors"
                  >
                    {t.aiKeep}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Member Count */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">{t.memberCountLabel}</label>
            <input
              type="number"
              value={memberCount}
              onChange={(e) => setMemberCount(e.target.value)}
              placeholder="e.g. 20"
              min={1}
              className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] text-sm"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!clubName.trim() || !clubType || !description.trim() || !memberCount}
            className="w-full py-4 bg-[#534AB7] text-white font-semibold rounded-2xl shadow-lg disabled:opacity-40"
          >
            {t.submitBtn}
          </button>
        </div>
      </main>

      {/* Copilot backdrop */}
      {showCopilot && (
        <div className="fixed inset-0 z-10" onClick={() => setShowCopilot(false)} />
      )}
    </div>
  );
}
