'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { QuizAnswers } from '@/lib/types';

// ─── Question data ────────────────────────────────────────────────────────────

type EffectMap = Record<string, string | number>;

type EffectOption = { emoji: string; text: string; effect: EffectMap };
type ScoreOption  = { emoji: string; text: string; score: number };
type AnyOption    = EffectOption | ScoreOption;

interface Question {
  title: string;
  layout: 'vertical' | 'grid';
  dimension?: 'perform' | 'sport' | 'creative' | 'academic';
  options: AnyOption[];
}

const QUESTIONS: Question[] = [
  // Q1 (index 0)
  {
    title: '周五晚上没有安排，你最可能在做什么？',
    layout: 'vertical',
    options: [
      { emoji: '🎉', text: '已经在群里喊人出去了',       effect: { social: 3 } },
      { emoji: '☕', text: '和固定的几个朋友约了饭',     effect: { social: 2 } },
      { emoji: '🛋', text: '窝在家里，终于可以自己待着', effect: { social: 1 } },
    ] as EffectOption[],
  },
  // Q2 (index 1)
  {
    title: '朋友让你帮忙做一个活动，你最想负责哪块？',
    layout: 'vertical',
    options: [
      { emoji: '💡', text: '策划和创意，我来想方案',   effect: { creative: 3, role: 'leader'   } },
      { emoji: '🔧', text: '执行落地，我来把它做出来', effect: { hands_on: 3, role: 'executor' } },
      { emoji: '🎤', text: '现场氛围，我来炒热气氛',   effect: { perform: 3,  role: 'member'   } },
    ] as EffectOption[],
  },
  // Q3 (index 2) — perform
  {
    title: '我们正在招募愿意站上舞台的你——表演、主持、演讲都欢迎',
    layout: 'grid',
    dimension: 'perform',
    options: [
      { emoji: '⚡', text: '好！这正是我想要的', score: 5 },
      { emoji: '👀', text: '有点心动，可以了解', score: 4 },
      { emoji: '🤷', text: '无所谓，都行',       score: 3 },
      { emoji: '😐', text: '不太适合我',         score: 2 },
      { emoji: '🙅', text: '完全不感兴趣',       score: 1 },
    ] as ScoreOption[],
  },
  // Q4 (index 3) — sport
  {
    title: '我们每周训练，一起备战校际联赛，要的就是那股拼劲',
    layout: 'grid',
    dimension: 'sport',
    options: [
      { emoji: '⚡', text: '好！这正是我想要的', score: 5 },
      { emoji: '👀', text: '有点心动，可以了解', score: 4 },
      { emoji: '🤷', text: '无所谓，都行',       score: 3 },
      { emoji: '😐', text: '不太适合我',         score: 2 },
      { emoji: '🙅', text: '完全不感兴趣',       score: 1 },
    ] as ScoreOption[],
  },
  // Q5 (index 4) — creative
  {
    title: '我们用镜头、画笔、代码创造东西，喜欢动手的你快来',
    layout: 'grid',
    dimension: 'creative',
    options: [
      { emoji: '⚡', text: '好！这正是我想要的', score: 5 },
      { emoji: '👀', text: '有点心动，可以了解', score: 4 },
      { emoji: '🤷', text: '无所谓，都行',       score: 3 },
      { emoji: '😐', text: '不太适合我',         score: 2 },
      { emoji: '🙅', text: '完全不感兴趣',       score: 1 },
    ] as ScoreOption[],
  },
  // Q6 (index 5) — academic
  {
    title: '我们每周读论文、做研究、办讲座，追求深度思考',
    layout: 'grid',
    dimension: 'academic',
    options: [
      { emoji: '⚡', text: '好！这正是我想要的', score: 5 },
      { emoji: '👀', text: '有点心动，可以了解', score: 4 },
      { emoji: '🤷', text: '无所谓，都行',       score: 3 },
      { emoji: '😐', text: '不太适合我',         score: 2 },
      { emoji: '🙅', text: '完全不感兴趣',       score: 1 },
    ] as ScoreOption[],
  },
  // Q7 (index 6)
  {
    title: '你理想的社团活动节奏是？',
    layout: 'vertical',
    options: [
      { emoji: '📅', text: '固定时间，雷打不动每周见',   effect: { schedule: 'regular'  } },
      { emoji: '🌊', text: '有活动才聚，平时自由',       effect: { schedule: 'flexible' } },
      { emoji: '🍃', text: '随缘，不想有太多固定安排',   effect: { schedule: 'casual'   } },
    ] as EffectOption[],
  },
  // Q8 (index 7)
  {
    title: '每周你愿意为社团投入多少时间？',
    layout: 'vertical',
    options: [
      { emoji: '🌱', text: '1-2小时，轻松参与就好',       effect: { hours: 1 } },
      { emoji: '⚖️', text: '3-5小时，认真但不影响学习', effect: { hours: 3 } },
      { emoji: '🔥', text: '5小时以上，我想全力投入',     effect: { hours: 5 } },
    ] as EffectOption[],
  },
  // Q9 (index 8)
  {
    title: '在社团里你最想成为？',
    layout: 'vertical',
    options: [
      { emoji: '👑', text: '带头的人，我喜欢负责和决策', effect: { role: 'leader'   } },
      { emoji: '💪', text: '核心骨干，把事情做到最好',   effect: { role: 'executor' } },
      { emoji: '🌸', text: '自在参与，不想有太多压力',   effect: { role: 'member'   } },
    ] as EffectOption[],
  },
  // Q10 (index 9)
  {
    title: '你的理想社团，朋友圈发的是什么？',
    layout: 'vertical',
    options: [
      { emoji: '🎭', text: '演出谢幕后和全体成员的大合照',   effect: { vibe: 'energetic',    perform:  1 } },
      { emoji: '🎨', text: '凌晨还在改的设计稿或拍摄素材',   effect: { vibe: 'professional', creative: 1 } },
      { emoji: '🏃', text: '训练完汗流浃背的自拍',           effect: { vibe: 'energetic',    sport:    1 } },
      { emoji: '📚', text: '图书馆一起备赛堆满资料的书桌',   effect: { vibe: 'professional', academic: 1 } },
      { emoji: '🫶', text: '社团小聚，随手拍的温馨日常',     effect: { vibe: 'warm',         social:   1 } },
    ] as EffectOption[],
  },
];

// Group 0: Q1,Q2 | Group 1: Q3-Q6 | Group 2: Q7-Q9 | Group 3: Q10
const GROUPS = [
  { title: '先聊聊你这个人',   subtitle: null,                          qIndices: [0, 1] },
  { title: '哪些事会让你心动', subtitle: '看到这条招募信息，你的第一反应是？', qIndices: [2, 3, 4, 5] },
  { title: '聊聊你的节奏',     subtitle: null,                          qIndices: [6, 7, 8] },
  { title: '最后一题！',       subtitle: null,                          qIndices: [9] },
];

// ─── Compute final answers ────────────────────────────────────────────────────

function computeAnswers(sel: Record<number, number>): QuizAnswers {
  const ans: QuizAnswers = {
    social: 0, creative: 0, perform: 0, sport: 0, academic: 0,
    schedule: null, hours: 3, role: null, vibe: null,
  };

  // First pass: Q3-Q6 set dimension scores
  ([2, 3, 4, 5] as const).forEach((qi) => {
    if (sel[qi] === undefined) return;
    const q = QUESTIONS[qi];
    const opt = q.options[sel[qi]] as ScoreOption;
    ans[q.dimension!] = opt.score;
  });

  // Second pass: effect questions (Q1, Q2, Q7, Q8, Q9, Q10)
  ([0, 1, 6, 7, 8, 9] as const).forEach((qi) => {
    if (sel[qi] === undefined) return;
    const opt = QUESTIONS[qi].options[sel[qi]] as EffectOption;
    Object.entries(opt.effect).forEach(([k, v]) => {
      if (k === 'schedule' || k === 'vibe' || k === 'role') {
        (ans as unknown as Record<string, unknown>)[k] = v;
      } else if (k !== 'hands_on' && typeof v === 'number') {
        const rec = ans as unknown as Record<string, number>;
        rec[k] = Math.min(5, (rec[k] || 0) + v);
      }
    });
  });

  return ans;
}

// ─── Option card ──────────────────────────────────────────────────────────────

function OptionCard({
  emoji, text, selected, onClick,
}: {
  emoji: string; text: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderRadius: 16,
        border: selected ? '2px solid #534AB7' : '2px solid #EDE9FF',
        background: selected ? '#EEEDFE' : '#fff',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{emoji}</span>
      <span style={{ fontSize: 15, color: selected ? '#534AB7' : '#3D3660', fontWeight: selected ? 500 : 400 }}>
        {text}
      </span>
    </button>
  );
}

// ─── Question block ───────────────────────────────────────────────────────────

const QuestionBlock = ({
  qIdx, question, selectedOpt, onSelect, refCallback,
}: {
  qIdx: number;
  question: Question;
  selectedOpt: number | undefined;
  onSelect: (optIdx: number) => void;
  refCallback: (el: HTMLDivElement | null) => void;
}) => {
  const isGrid = question.layout === 'grid';
  const opts = question.options;

  return (
    <div ref={refCallback} style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 18, fontWeight: 500, color: '#1A1240', marginBottom: 14, lineHeight: 1.5 }}>
        <span style={{ color: '#9B8EC4', fontSize: 14, fontWeight: 400, marginRight: 6 }}>
          Q{qIdx + 1}
        </span>
        {question.title}
      </p>

      {isGrid ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {opts.map((opt, i) => {
            const isLast = i === opts.length - 1 && opts.length % 2 === 1;
            return (
              <div
                key={i}
                style={isLast ? { gridColumn: '1 / -1', display: 'flex', justifyContent: 'center' } : {}}
              >
                <div style={isLast ? { width: 'calc(50% - 5px)' } : { width: '100%' }}>
                  <OptionCard
                    emoji={opt.emoji}
                    text={opt.text}
                    selected={selectedOpt === i}
                    onClick={() => onSelect(i)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opts.map((opt, i) => (
            <OptionCard
              key={i}
              emoji={opt.emoji}
              text={opt.text}
              selected={selectedOpt === i}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter();
  const [currentGroup, setCurrentGroup] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [scrolledFor, setScrolledFor] = useState<Set<number>>(new Set());

  const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const nextBtnRef   = useRef<HTMLDivElement | null>(null);

  const group = GROUPS[currentGroup];
  const groupComplete = group.qIndices.every((qi) => selected[qi] !== undefined);

  const handleSelect = useCallback(
    (qIdx: number, optIdx: number) => {
      const newSelected = { ...selected, [qIdx]: optIdx };
      setSelected(newSelected);

      const isLastQ       = qIdx === 9;
      const isLastInGroup = qIdx === group.qIndices[group.qIndices.length - 1];
      const firstTime     = !scrolledFor.has(qIdx);

      if (firstTime) {
        setScrolledFor((prev) => new Set(prev).add(qIdx));
      }

      if (isLastQ) {
        const answers = computeAnswers(newSelected);
        localStorage.setItem('quizAnswers', JSON.stringify(answers));
        setTimeout(() => router.push('/student/recommendations'), 450);
        return;
      }

      if (!firstTime) return; // re-selection: don't re-scroll

      if (isLastInGroup) {
        setTimeout(() => {
          nextBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      } else {
        const idxInGroup  = group.qIndices.indexOf(qIdx);
        const nextQIdx    = group.qIndices[idxInGroup + 1];
        setTimeout(() => {
          questionRefs.current[nextQIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    },
    [selected, scrolledFor, group, router],
  );

  function handleNextGroup() {
    setCurrentGroup((g) => g + 1);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  const progressPct = ((currentGroup) / GROUPS.length) * 100;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7FF' }}>
      <Navbar title="了解你自己" />

      <main style={{ padding: '20px 16px 40px' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {GROUPS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 6, borderRadius: 99,
                  background: i <= currentGroup ? '#534AB7' : '#DDD8FF',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#9B8EC4' }}>
            第 {currentGroup + 1} 组 / 共 {GROUPS.length} 组
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1240', marginTop: 4 }}>
            {group.title}
          </h1>
          {group.subtitle && (
            <p style={{ fontSize: 14, color: '#6B5FA6', marginTop: 4 }}>{group.subtitle}</p>
          )}
        </div>

        {/* Questions */}
        {group.qIndices.map((qIdx) => (
          <QuestionBlock
            key={qIdx}
            qIdx={qIdx}
            question={QUESTIONS[qIdx]}
            selectedOpt={selected[qIdx]}
            onSelect={(optIdx) => handleSelect(qIdx, optIdx)}
            refCallback={(el) => { questionRefs.current[qIdx] = el; }}
          />
        ))}

        {/* Next group button */}
        {currentGroup < GROUPS.length - 1 && (
          <div ref={nextBtnRef} style={{ marginTop: 12 }}>
            <button
              onClick={handleNextGroup}
              disabled={!groupComplete}
              style={{
                width: '100%', padding: '16px 0',
                borderRadius: 16,
                border: 'none',
                background: groupComplete ? '#534AB7' : '#C9C0F0',
                color: '#fff',
                fontSize: 16, fontWeight: 600,
                cursor: groupComplete ? 'pointer' : 'default',
                transition: 'background 0.2s',
              }}
            >
              {groupComplete ? `继续 →` : `请完成本组所有题目`}
            </button>
          </div>
        )}

        {/* Redirect hint for Q10 */}
        {currentGroup === GROUPS.length - 1 && selected[9] !== undefined && (
          <div style={{ textAlign: 'center', marginTop: 20, color: '#9B8EC4', fontSize: 14 }}>
            正在生成你的专属推荐…
          </div>
        )}
      </main>
    </div>
  );
}
