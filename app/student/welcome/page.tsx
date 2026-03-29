import Link from 'next/link';

const highlights = [
  {
    icon: '🤖',
    title: 'AI 智能匹配',
    desc: '根据兴趣、目标、时间三维度精准推荐',
  },
  {
    icon: '💬',
    title: '真实成员评价',
    desc: '已验证成员匿名评分，告别水分信息',
  },
  {
    icon: '⚡',
    title: '一键报名',
    desc: '看中就申请，社团实时回复',
  },
];

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col px-4 py-8">
      {/* Back */}
      <Link href="/" className="text-[#534AB7] text-sm flex items-center gap-1 mb-8 w-fit">
        ← 返回首页
      </Link>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-[#534AB7] flex items-center justify-center mb-6 shadow-xl">
          <span className="text-4xl">🎯</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A1240] leading-tight mb-3">
          找到真正<br />适合你的社团
        </h1>
        <p className="text-[#6B5FA6] text-sm max-w-xs leading-relaxed">
          回答几个简单问题，让 AI 从数十个社团中为你精准筛选
        </p>
      </div>

      {/* Highlights */}
      <div className="flex flex-col gap-3 mb-8">
        {highlights.map((h) => (
          <div key={h.title} className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm border border-[#F0EEFF]">
            <div className="w-11 h-11 rounded-xl bg-[#EDE9FF] flex items-center justify-center shrink-0 text-xl">
              {h.icon}
            </div>
            <div>
              <p className="font-semibold text-[#1A1240] text-sm">{h.title}</p>
              <p className="text-[#9B8EC4] text-xs mt-0.5">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-[#9B8EC4]">⏱️ 问卷约 3 分钟</p>
        <Link href="/student/quiz" className="w-full">
          <button className="w-full py-4 bg-[#534AB7] text-white font-semibold rounded-2xl shadow-lg text-base">
            开始测评 →
          </button>
        </Link>
      </div>
    </main>
  );
}
