'use client';

import { useState } from 'react';
import Navbar from '@/components/shared/Navbar';

const CLUB_TYPES = ['文艺', '体育', '学术', '公益', '科技'];

type CopilotAction = '帮我写' | '帮我优化' | '帮我缩短' | '帮我扩写';

export default function CreateClubPage() {
  const [clubName, setClubName] = useState('');
  const [clubType, setClubType] = useState('');
  const [description, setDescription] = useState('');
  const [memberCount, setMemberCount] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // AI Copilot state
  const [showCopilot, setShowCopilot] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResult, setCopilotResult] = useState('');
  const [copilotOriginal, setCopilotOriginal] = useState('');
  const [showCompare, setShowCompare] = useState(false);

  const handleSubmit = () => {
    if (!clubName.trim() || !clubType || !description.trim() || !memberCount) return;
    setSubmitted(true);
  };

  const buildPrompt = (action: CopilotAction): string => {
    const context = clubName ? `社团名称：${clubName}，类型：${clubType}。` : '';
    switch (action) {
      case '帮我写':
        return `你是一个社团招新文案专家。${context}请帮我写一段社团简介，让它吸引新生，语言生动有感染力，100-150字以内。只返回简介文字，不要其他内容。`;
      case '帮我优化':
        return `你是一个社团招新文案专家。请优化以下社团简介，让它更吸引新生，语言生动有感染力，保留原有信息，100-150字以内。只返回优化后的文字。原简介：${description}`;
      case '帮我缩短':
        return `请把以下社团简介压缩到50字以内，保留最核心的信息。只返回压缩后的文字。原简介：${description}`;
      case '帮我扩写':
        return `请把以下社团简介扩展得更丰富详细，150-200字左右，突出社团特色和对新生的吸引力。只返回扩写后的文字。原简介：${description}`;
    }
  };

  const handleCopilotAction = async (action: CopilotAction) => {
    if (action !== '帮我写' && !description.trim()) return;
    setShowCopilot(false);
    setCopilotLoading(true);
    setCopilotResult('');
    setCopilotOriginal(description);
    setShowCompare(false);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: buildPrompt(action) }),
      });
      const data = await res.json();
      setCopilotResult(data.reply || '生成失败，请重试');
      setShowCompare(true);
    } catch {
      setCopilotResult('生成失败，请重试');
      setShowCompare(true);
    }
    setCopilotLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
        <Navbar title="申请创建社团" />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="text-xl font-bold text-[#1A1240] mb-2">申请已提交</h2>
          <p className="text-[#6B5FA6] text-center text-sm leading-relaxed">
            等待学校审核，通常需要3-5个工作日。
            <br />审核结果将通过站内消息通知你。
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar title="申请创建社团" />

      <main className="flex-1 px-4 py-6">
        <p className="text-[#6B5FA6] text-sm mb-5">填写基本信息，提交后等待学校审核</p>

        <div className="flex flex-col gap-4">
          {/* Club Name */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">社团名称 *</label>
            <input
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="请输入社团名称"
              className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] text-sm"
            />
          </div>

          {/* Club Type */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-[#4A4A6A] mb-3">社团类型 *</label>
            <div className="flex flex-wrap gap-2">
              {CLUB_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setClubType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    clubType === type
                      ? 'bg-[#534AB7] text-white'
                      : 'bg-[#F5F3FF] text-[#6B5FA6] border border-[#E5DEFF]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Description with AI Copilot */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#4A4A6A]">社团简介 *</label>
              <div className="relative">
                <button
                  onClick={() => setShowCopilot((v) => !v)}
                  disabled={copilotLoading}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#EDE9FF] text-[#534AB7] font-medium hover:bg-[#D4CEFF] transition-colors disabled:opacity-50"
                >
                  {copilotLoading ? '生成中...' : '✨ AI'}
                </button>
                {showCopilot && (
                  <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-[#E5DEFF] z-20 w-44 py-1">
                    {(['帮我写', '帮我优化', '帮我缩短', '帮我扩写'] as CopilotAction[]).map((action) => (
                      <button
                        key={action}
                        onClick={() => handleCopilotAction(action)}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#1A1240] hover:bg-[#F5F3FF] transition-colors"
                      >
                        {action}
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
              placeholder="介绍你想创建的社团，包括目标、活动形式等"
              className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] resize-none text-sm"
            />

            {/* AI Compare block */}
            {showCompare && (
              <div className="mt-3 border border-[#E5DEFF] rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-[#E5DEFF]">
                  <div className="p-3">
                    <p className="text-xs font-medium text-[#9B8EC4] mb-1.5">原简介</p>
                    <p className="text-xs text-[#4A4A6A] leading-relaxed">{copilotOriginal || '（空）'}</p>
                  </div>
                  <div className="p-3 bg-[#F5F3FF]">
                    <p className="text-xs font-medium text-[#534AB7] mb-1.5">AI 优化版</p>
                    <p className="text-xs text-[#1A1240] leading-relaxed">{copilotResult}</p>
                  </div>
                </div>
                <div className="flex border-t border-[#E5DEFF]">
                  <button
                    onClick={() => { setDescription(copilotResult); setShowCompare(false); }}
                    className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#534AB7] hover:bg-[#4338CA] transition-colors"
                  >
                    使用优化版
                  </button>
                  <button
                    onClick={() => setShowCompare(false)}
                    className="flex-1 py-2.5 text-xs font-semibold text-[#6B5FA6] hover:bg-[#F0EEFF] transition-colors"
                  >
                    保留原版
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Member Count */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">预计招募人数 *</label>
            <input
              type="number"
              value={memberCount}
              onChange={(e) => setMemberCount(e.target.value)}
              placeholder="例如：20"
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
            提交申请
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
