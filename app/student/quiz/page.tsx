'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { QuizAnswers } from '@/lib/types';
import { useLanguage } from '@/lib/i18n';

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

// Language-independent data (effects, scores, emoji, layout, dimension)
const QUESTIONS_DATA = [
  // Q1
  {
    layout: 'vertical' as const,
    options: [
      { emoji: '🎉', effect: { social: 3 } },
      { emoji: '☕', effect: { social: 2 } },
      { emoji: '🛋', effect: { social: 1 } },
    ],
  },
  // Q2
  {
    layout: 'vertical' as const,
    options: [
      { emoji: '💡', effect: { creative: 3, role: 'leader'   } },
      { emoji: '🔧', effect: { hands_on: 3, role: 'executor' } },
      { emoji: '🎤', effect: { perform: 3,  role: 'member'   } },
    ],
  },
  // Q3 — perform
  {
    layout: 'grid' as const,
    dimension: 'perform' as const,
    options: [
      { emoji: '⚡', score: 5 },
      { emoji: '👀', score: 4 },
      { emoji: '🤷', score: 3 },
      { emoji: '😐', score: 2 },
      { emoji: '🙅', score: 1 },
    ],
  },
  // Q4 — sport
  {
    layout: 'grid' as const,
    dimension: 'sport' as const,
    options: [
      { emoji: '⚡', score: 5 },
      { emoji: '👀', score: 4 },
      { emoji: '🤷', score: 3 },
      { emoji: '😐', score: 2 },
      { emoji: '🙅', score: 1 },
    ],
  },
  // Q5 — creative
  {
    layout: 'grid' as const,
    dimension: 'creative' as const,
    options: [
      { emoji: '⚡', score: 5 },
      { emoji: '👀', score: 4 },
      { emoji: '🤷', score: 3 },
      { emoji: '😐', score: 2 },
      { emoji: '🙅', score: 1 },
    ],
  },
  // Q6 — academic
  {
    layout: 'grid' as const,
    dimension: 'academic' as const,
    options: [
      { emoji: '⚡', score: 5 },
      { emoji: '👀', score: 4 },
      { emoji: '🤷', score: 3 },
      { emoji: '😐', score: 2 },
      { emoji: '🙅', score: 1 },
    ],
  },
  // Q7
  {
    layout: 'vertical' as const,
    options: [
      { emoji: '📅', effect: { schedule: 'regular'  } },
      { emoji: '🌊', effect: { schedule: 'flexible' } },
      { emoji: '🍃', effect: { schedule: 'casual'   } },
    ],
  },
  // Q8
  {
    layout: 'vertical' as const,
    options: [
      { emoji: '🌱', effect: { hours: 1 } },
      { emoji: '⚖️', effect: { hours: 3 } },
      { emoji: '🔥', effect: { hours: 5 } },
    ],
  },
  // Q9
  {
    layout: 'vertical' as const,
    options: [
      { emoji: '👑', effect: { role: 'leader'   } },
      { emoji: '💪', effect: { role: 'executor' } },
      { emoji: '🌸', effect: { role: 'member'   } },
    ],
  },
  // Q10
  {
    layout: 'vertical' as const,
    options: [
      { emoji: '🎭', effect: { vibe: 'energetic',    perform:  1 } },
      { emoji: '🎨', effect: { vibe: 'professional', creative: 1 } },
      { emoji: '🏃', effect: { vibe: 'energetic',    sport:    1 } },
      { emoji: '📚', effect: { vibe: 'professional', academic: 1 } },
      { emoji: '🫶', effect: { vibe: 'warm',         social:   1 } },
    ],
  },
];

// ─── Bilingual text ───────────────────────────────────────────────────────────

const SCORE_OPTIONS_ZH = ['好！这正是我想要的', '有点心动，可以了解', '无所谓，都行', '不太适合我', '完全不感兴趣'];
const SCORE_OPTIONS_EN = ["Yes! That's exactly what I'm looking for", "Intrigued — I'd like to know more", 'Either way works for me', 'Not really my thing', 'Not interested at all'];

const TEXT = {
  zh: {
    navTitle: '了解你自己',
    groupCounter: (cur: number, total: number) => `第 ${cur} 组 / 共 ${total} 组`,
    btnContinue: '继续 →',
    btnIncomplete: '请完成本组所有题目',
    generating: '正在生成你的专属推荐…',
    groups: [
      { title: '先聊聊你这个人',   subtitle: null },
      { title: '哪些事会让你心动', subtitle: '看到这条招募信息，你的第一反应是？' },
      { title: '聊聊你的节奏',     subtitle: null },
      { title: '最后一题！',       subtitle: null },
    ],
    questions: [
      { title: '周五晚上没有安排，你最可能在做什么？',         options: ['已经在群里喊人出去了', '和固定的几个朋友约了饭', '窝在家里，终于可以自己待着'] },
      { title: '朋友让你帮忙做一个活动，你最想负责哪块？',     options: ['策划和创意，我来想方案', '执行落地，我来把它做出来', '现场氛围，我来炒热气氛'] },
      { title: '我们正在招募愿意站上舞台的你——表演、主持、演讲都欢迎', options: SCORE_OPTIONS_ZH },
      { title: '我们每周训练，一起备战校际联赛，要的就是那股拼劲',     options: SCORE_OPTIONS_ZH },
      { title: '我们用镜头、画笔、代码创造东西，喜欢动手的你快来',     options: SCORE_OPTIONS_ZH },
      { title: '我们每周读论文、做研究、办讲座，追求深度思考',         options: SCORE_OPTIONS_ZH },
      { title: '你理想的社团活动节奏是？',     options: ['固定时间，雷打不动每周见', '有活动才聚，平时自由', '随缘，不想有太多固定安排'] },
      { title: '每周你愿意为社团投入多少时间？', options: ['1-2小时，轻松参与就好', '3-5小时，认真但不影响学习', '5小时以上，我想全力投入'] },
      { title: '在社团里你最想成为？',         options: ['带头的人，我喜欢负责和决策', '核心骨干，把事情做到最好', '自在参与，不想有太多压力'] },
      { title: '你的理想社团，朋友圈发的是什么？', options: ['演出谢幕后和全体成员的大合照', '凌晨还在改的设计稿或拍摄素材', '训练完汗流浃背的自拍', '图书馆一起备赛堆满资料的书桌', '社团小聚，随手拍的温馨日常'] },
    ],
  },
  en: {
    navTitle: "Let's Find Your Fit",
    groupCounter: (cur: number, total: number) => `Group ${cur} of ${total}`,
    btnContinue: 'Continue →',
    btnIncomplete: 'Please answer all questions',
    generating: 'Generating your personalized recommendations…',
    groups: [
      { title: 'Tell Us About You',    subtitle: null },
      { title: 'What Gets You Excited', subtitle: "You just saw this recruitment post — what's your gut reaction?" },
      { title: 'Your Pace',            subtitle: null },
      { title: 'Last One!',            subtitle: null },
    ],
    questions: [
      { title: 'What are you most likely doing on a free Friday night?',           options: ["Already texting the group chat — let's go out", 'Having dinner with my close friend group', 'Home alone, finally some peace and quiet'] },
      { title: 'A friend asks for help organizing an event. What role do you want?', options: ["Planning and ideas — I'll come up with the concept", "Execution — I'll make it happen", "Hype — I'll get everyone excited on the day"] },
      { title: "We're looking for people ready to take the stage — performance, hosting, speaking, all welcome", options: SCORE_OPTIONS_EN },
      { title: "We train every week and compete in inter-college leagues — it's all about that drive",           options: SCORE_OPTIONS_EN },
      { title: 'We create with cameras, paintbrushes, and code — come join if you love making things',         options: SCORE_OPTIONS_EN },
      { title: 'We read papers, do research, and host talks every week — deep thinking is our thing',          options: SCORE_OPTIONS_EN },
      { title: "What's your ideal club meeting schedule?",               options: ['Fixed time every week — no exceptions', "Meet when there's an event, free otherwise", "Casual — I don't want too many fixed commitments"] },
      { title: 'How many hours per week are you willing to put into a club?', options: ['1-2 hrs — light involvement', '3-5 hrs — committed but academics come first', '5+ hrs — I want to go all in'] },
      { title: 'What role do you see yourself playing in a club?',       options: ['The leader — I like being in charge and making decisions', 'Core member — I want to do things really well', 'Just participating — no pressure please'] },
      { title: "What would your ideal club's social media look like?",   options: ['Group photo with the full cast after the final curtain call', 'Design drafts still being tweaked at midnight', 'Post-training sweaty selfie', 'Library table piled with notes before a competition', 'Casual club hangout snapshots'] },
    ],
  },
};

// Merge translated text onto the data to produce typed Question objects
function buildQuestions(lang: 'zh' | 'en'): Question[] {
  const labels = TEXT[lang].questions;
  return QUESTIONS_DATA.map((data, qi) => ({
    title: labels[qi].title,
    layout: data.layout,
    ...(('dimension' in data) ? { dimension: data.dimension } : {}),
    options: data.options.map((opt, i) => ({
      emoji: opt.emoji,
      text: labels[qi].options[i],
      ...('effect' in opt ? { effect: opt.effect } : { score: (opt as { score: number }).score }),
    })),
  })) as Question[];
}

// Group 0: Q1,Q2 | Group 1: Q3-Q6 | Group 2: Q7-Q9 | Group 3: Q10
const GROUP_INDICES = [[0, 1], [2, 3, 4, 5], [6, 7, 8], [9]];

// ─── Compute final answers ────────────────────────────────────────────────────

function computeAnswers(sel: Record<number, number>, questions: Question[]): QuizAnswers {
  const ans: QuizAnswers = {
    social: 0, creative: 0, perform: 0, sport: 0, academic: 0,
    schedule: null, hours: 3, role: null, vibe: null,
  };

  // First pass: Q3-Q6 set dimension scores
  ([2, 3, 4, 5] as const).forEach((qi) => {
    if (sel[qi] === undefined) return;
    const q = questions[qi];
    const opt = q.options[sel[qi]] as ScoreOption;
    ans[q.dimension!] = opt.score;
  });

  // Second pass: effect questions (Q1, Q2, Q7, Q8, Q9, Q10)
  ([0, 1, 6, 7, 8, 9] as const).forEach((qi) => {
    if (sel[qi] === undefined) return;
    const opt = questions[qi].options[sel[qi]] as EffectOption;
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
  const { language } = useLanguage();
  const t = TEXT[language];
  const QUESTIONS = buildQuestions(language);
  const GROUPS = GROUP_INDICES.map((qIndices, i) => ({ ...t.groups[i], qIndices }));

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
        const answers = computeAnswers(newSelected, QUESTIONS);
        localStorage.setItem('quizAnswers', JSON.stringify(answers));
        setTimeout(() => router.push('/student/recommendations'), 450);
        return;
      }

      if (!firstTime) return;

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
    [selected, scrolledFor, group, router, QUESTIONS],
  );

  function handleNextGroup() {
    setCurrentGroup((g) => g + 1);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7FF' }}>
      <Navbar title={t.navTitle} />

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
            {t.groupCounter(currentGroup + 1, GROUPS.length)}
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
              {groupComplete ? t.btnContinue : t.btnIncomplete}
            </button>
          </div>
        )}

        {/* Redirect hint for Q10 */}
        {currentGroup === GROUPS.length - 1 && selected[9] !== undefined && (
          <div style={{ textAlign: 'center', marginTop: 20, color: '#9B8EC4', fontSize: 14 }}>
            {t.generating}
          </div>
        )}
      </main>
    </div>
  );
}
