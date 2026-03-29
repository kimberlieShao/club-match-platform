'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = '待审核' | '已通过' | '已拒绝';
type SortKey = 'match' | 'time' | 'composite';

interface Dims {
  perform: number;   // 1-5
  creative: number;
  sport: number;
  academic: number;
  social: number;
}

interface Applicant {
  id: string;
  name: string;
  major: string;
  grade: string;
  contact: string;
  mbti: string;
  zodiac: string;
  bio: string;
  matchScore: number;       // 0-100
  compositeScore: number;   // derived overall rating
  aiOneLiner: string;
  aiDetail: string;         // 3-4 sentences
  dims: Dims;
  status: Status;
  appliedAt: string;        // ISO-ish string for display
  hasResume: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: '1',
    name: '刘雨欣',
    major: '英语专业',
    grade: '大一',
    contact: 'liuyuxin@edu.cn',
    mbti: 'ENFJ',
    zodiac: '白羊座',
    bio: '热爱舞台，大一就参加了系里的戏剧节演出。喜欢用表演表达情感，希望在社团里找到志同道合的伙伴，一起创作更多有意义的作品。',
    matchScore: 94,
    compositeScore: 91,
    aiOneLiner: '表达欲强、舞台经验丰富，时间极其充裕',
    aiDetail:
      '刘雨欣在问卷中对表演和舞台的热情几乎满分，且每周可投入6小时以上，时间与社团节奏完全契合。她的ENFJ人格特质使她在团队协作和带动气氛上表现突出，是天然的活动核心人物。自我介绍中提到已有实际演出经验，入门成本低、上手快。综合来看，是本轮申请者中与戏剧社最匹配的候选人之一。',
    dims: { perform: 5, creative: 4, sport: 2, academic: 3, social: 5 },
    status: '待审核',
    appliedAt: '10分钟前',
    hasResume: true,
  },
  {
    id: '2',
    name: '陈思远',
    major: '戏剧影视学',
    grade: '大三',
    contact: '138-0013-8000',
    mbti: 'INFJ',
    zodiac: '双鱼座',
    bio: '就读于戏剧影视学专业，有扎实的表演理论基础，参与过两部校级话剧演出。对剧本创作也有浓厚兴趣，希望在实践中不断打磨技艺。',
    matchScore: 92,
    compositeScore: 95,
    aiOneLiner: '专业背景扎实，创意与执行力并重',
    aiDetail:
      '陈思远来自戏剧影视学专业，学科背景与社团高度一致，在表演和创意维度均得到了极高评分。INFJ的人格让他在创作上有深度思考，能为剧目带来独特视角。大三的年级意味着他拥有更多可支配时间和更成熟的团队配合经验。唯一需要关注的是他偏内向，可能需要一定时间融入集体，但整体来看是非常优质的候选人。',
    dims: { perform: 5, creative: 5, sport: 1, academic: 4, social: 3 },
    status: '待审核',
    appliedAt: '1小时前',
    hasResume: true,
  },
  {
    id: '3',
    name: '林晓雨',
    major: '汉语言文学',
    grade: '大二',
    contact: 'linxiaoyu@edu.cn',
    mbti: 'ENFP',
    zodiac: '天蝎座',
    bio: '文学系的我对语言和叙事有天然的敏感度，平时喜欢写剧评和短篇剧本。觉得戏剧是文学的最高表达形式，想把文字搬上舞台。',
    matchScore: 87,
    compositeScore: 83,
    aiOneLiner: '文学底蕴深厚，创意驱动型人格',
    aiDetail:
      '林晓雨的文学专业背景为剧本创作提供了天然优势，她在创意维度得分很高，有独立创作经验。ENFP的人格赋予她丰富的想象力和感染力，在排练中往往能激发团队创意。时间上每周可投入3-5小时，适合担任编剧或创作类骨干角色。建议在面试中重点考察她的舞台表现欲与合作意愿。',
    dims: { perform: 3, creative: 5, sport: 1, academic: 4, social: 4 },
    status: '待审核',
    appliedAt: '3小时前',
    hasResume: false,
  },
  {
    id: '4',
    name: '赵子轩',
    major: '心理学',
    grade: '大二',
    contact: 'zhaozixuan@edu.cn',
    mbti: 'INFJ',
    zodiac: '水瓶座',
    bio: '学心理学让我对人物内心世界有更深的理解，这让我在表演时能更真实地传达角色情感。希望加入社团，用表演来探索人性。',
    matchScore: 85,
    compositeScore: 82,
    aiOneLiner: '情感洞察力强，角色诠释有深度',
    aiDetail:
      '赵子轩的心理学背景是戏剧表演的独特加分项，他能从人格和动机视角解读角色，使表演更具说服力。在问卷中他偏好有深度的创作型活动，与社团的艺术气质相符。时间方面每周可投入3小时，属于"认真但平衡型"参与者。整体是一个稳健的中等匹配候选人，适合担任配角或剧本分析类职能。',
    dims: { perform: 4, creative: 4, sport: 1, academic: 5, social: 3 },
    status: '已通过',
    appliedAt: '昨天 14:32',
    hasResume: true,
  },
  {
    id: '5',
    name: '李梦琪',
    major: '音乐表演',
    grade: '大二',
    contact: '139-5566-7788',
    mbti: 'INFP',
    zodiac: '巨蟹座',
    bio: '主修声乐，对音乐剧充满热情。希望借助戏剧社的平台，将声音与肢体表演结合，探索更立体的舞台艺术形式。',
    matchScore: 76,
    compositeScore: 78,
    aiOneLiner: '声乐专长突出，跨界表演潜力大',
    aiDetail:
      '李梦琪来自音乐表演专业，声乐能力是社团目前较为欠缺的技能方向，加入后能显著提升剧目的音乐维度。INFP的性格使她在创作上较为敏感细腻，但在大型合作中可能需要更多引导。她对音乐剧的热情和每周3小时的时间投入说明她有明确目标但也注重平衡。综合评估属于特色型候选人，适合有音乐元素的剧目。',
    dims: { perform: 4, creative: 3, sport: 2, academic: 2, social: 3 },
    status: '待审核',
    appliedAt: '昨天 09:15',
    hasResume: false,
  },
  {
    id: '6',
    name: '张浩然',
    major: '计算机科学',
    grade: '大一',
    contact: 'zhanghaoran@edu.cn',
    mbti: 'INTJ',
    zodiac: '摩羯座',
    bio: '理工科背景，但从小热爱表演。高中时连续三年参加校话剧，担任过主角。希望在大学继续这个爱好，同时用工科思维为社团带来一些新的可能。',
    matchScore: 81,
    compositeScore: 79,
    aiOneLiner: '理工反差感强，有舞台经验积累',
    aiDetail:
      '张浩然的计算机背景在戏剧社中属于稀缺资源，他有潜力参与舞台技术、灯光或宣传设计方面的工作。高中三年话剧主角经历证明他的表演热情是真实且持久的，而非一时兴趣。INTJ人格使他在执行层面较为严谨，能推动项目落地。大一身份意味着可培养周期长，是值得投资的潜力股候选人。',
    dims: { perform: 4, creative: 3, sport: 2, academic: 5, social: 2 },
    status: '已拒绝',
    appliedAt: '2天前',
    hasResume: true,
  },
  {
    id: '7',
    name: '王天明',
    major: '体育教育',
    grade: '大三',
    contact: '135-9900-1234',
    mbti: 'ESTP',
    zodiac: '狮子座',
    bio: '体育生，但对表演一直有好奇心。室友拉我来试试，觉得挺有意思的，想了解一下戏剧是什么感觉。',
    matchScore: 68,
    compositeScore: 65,
    aiOneLiner: '身体表现力强，动机有待确认',
    aiDetail:
      '王天明的运动底子赋予他极强的肢体表现力，这在戏剧表演中是难得的优势。然而他的申请动机较为被动（室友推荐），在问卷中对表演的主动热情评分偏低，与社团核心调性存在一定落差。ESTP人格使他行动力强、现场反应快，适合高强度排练节奏。建议在面试中重点考察他的主观意愿和长期坚持的可能性。',
    dims: { perform: 2, creative: 1, sport: 5, academic: 1, social: 4 },
    status: '待审核',
    appliedAt: '3天前',
    hasResume: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Status, { bg: string; color: string; dot: string }> = {
  待审核: { bg: '#FEF9C3', color: '#854D0E', dot: '#F59E0B' },
  已通过: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
  已拒绝: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};

const DIM_LABELS: [keyof Dims, string][] = [
  ['perform',  '表演'],
  ['creative', '创意'],
  ['sport',    '运动'],
  ['academic', '学术'],
  ['social',   '社交'],
];

const MBTI_COLOR: Record<string, string> = {
  E: '#EDE9FF', I: '#E0F2FE', N: '#FCE7F3', S: '#D1FAE5',
  F: '#FEF9C3', T: '#FFEDD5', J: '#E0E7FF', P: '#F0FDF4',
};

function mbtiColor(mbti: string) {
  return MBTI_COLOR[mbti[1]] ?? '#F3F4F6';
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg,#534AB7,#7C6FD6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.4, fontWeight: 700, color: '#fff',
      }}
    >
      {name[0]}
    </div>
  );
}

// ─── Dim bars ─────────────────────────────────────────────────────────────────

function DimBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#6B5FA6' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#534AB7' }}>{value}/5</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: '#EDE9FF', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', width: `${(value / 5) * 100}%`,
            background: 'linear-gradient(90deg,#534AB7,#8B7FEA)',
            borderRadius: 99, transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({
  applicant,
  onClose,
  onUpdateStatus,
}: {
  applicant: Applicant | null;
  onClose: () => void;
  onUpdateStatus: (id: string, s: Status) => void;
}) {
  if (!applicant) return null;
  const st = STATUS_STYLES[applicant.status];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 40,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 420,
          background: '#fff',
          zIndex: 50,
          overflowY: 'auto',
          boxShadow: '-4px 0 24px rgba(83,74,183,0.15)',
          animation: 'slideInRight 0.25s ease',
        }}
      >
        <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div
          style={{
            position: 'sticky', top: 0, zIndex: 1,
            background: '#fff',
            borderBottom: '1px solid #F0EEFF',
            padding: '16px 16px 12px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1.5px solid #DDD8FF', background: '#F5F3FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, fontSize: 16,
            }}
          >
            ✕
          </button>
          <Avatar name={applicant.name} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1240' }}>{applicant.name}</span>
              <span
                style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                  background: st.bg, color: st.color,
                }}
              >
                {applicant.status}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#9B8EC4', marginTop: 2 }}>
              {applicant.grade} · {applicant.major}
            </p>
          </div>
        </div>

        <div style={{ padding: '16px 16px 100px' }}>
          {/* Match score */}
          <div
            style={{
              background: 'linear-gradient(135deg,#534AB7,#7C6FD6)',
              borderRadius: 16, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>与社团匹配度</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                {applicant.matchScore}<span style={{ fontSize: 16 }}>%</span>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>综合评分</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                {applicant.compositeScore}<span style={{ fontSize: 13 }}>分</span>
              </p>
            </div>
          </div>

          {/* Basic info */}
          <Section title="基本信息">
            <InfoRow label="联系方式" value={applicant.contact} />
            <InfoRow label="申请时间" value={applicant.appliedAt} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Tag text={applicant.mbti} bg={mbtiColor(applicant.mbti)} color="#534AB7" />
              <Tag text={applicant.zodiac} bg="#FEF9C3" color="#854D0E" />
            </div>
          </Section>

          {/* Bio */}
          <Section title="自我介绍">
            <p style={{ fontSize: 14, color: '#3D3660', lineHeight: 1.7 }}>{applicant.bio}</p>
          </Section>

          {/* Dimensions */}
          <Section title="问卷维度分析">
            {DIM_LABELS.map(([key, label]) => (
              <DimBar key={key} label={label} value={applicant.dims[key]} />
            ))}
          </Section>

          {/* AI detail */}
          <Section title="AI 综合评估">
            <div
              style={{
                background: '#F5F3FF', borderRadius: 12,
                padding: '12px 14px',
                fontSize: 14, color: '#3C3489', lineHeight: 1.75,
              }}
            >
              ✨ {applicant.aiDetail}
            </div>
          </Section>

          {/* Resume */}
          {applicant.hasResume && (
            <Section title="简历">
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 14px',
                  borderRadius: 12, border: '1.5px solid #DDD8FF',
                  background: '#F5F3FF', cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 20 }}>📄</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#534AB7' }}>下载简历</p>
                  <p style={{ fontSize: 11, color: '#9B8EC4' }}>PDF · {applicant.name}_简历.pdf</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#9B8EC4', fontSize: 16 }}>↓</span>
              </button>
            </Section>
          )}
        </div>

        {/* Bottom actions — fixed inside panel */}
        {applicant.status === '待审核' && (
          <div
            style={{
              position: 'sticky', bottom: 0,
              background: '#fff',
              borderTop: '1px solid #F0EEFF',
              padding: '12px 16px',
              display: 'flex', gap: 10,
            }}
          >
            <button
              onClick={() => onUpdateStatus(applicant.id, '已拒绝')}
              style={{
                flex: 1, padding: '13px 0', borderRadius: 14,
                border: '1.5px solid #FCA5A5', background: '#FFF5F5',
                color: '#DC2626', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              拒绝
            </button>
            <button
              onClick={() => onUpdateStatus(applicant.id, '稍后决定' as Status)}
              style={{
                flex: 1, padding: '13px 0', borderRadius: 14,
                border: '1.5px solid #DDD8FF', background: '#F5F3FF',
                color: '#534AB7', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              稍后
            </button>
            <button
              onClick={() => onUpdateStatus(applicant.id, '已通过')}
              style={{
                flex: 1, padding: '13px 0', borderRadius: 14,
                border: 'none', background: '#10B981',
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}
            >
              通过 ✓
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h3
        style={{
          fontSize: 13, fontWeight: 700, color: '#9B8EC4',
          textTransform: 'uppercase', letterSpacing: 0.8,
          marginBottom: 10,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 13, color: '#9B8EC4' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1A1240', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function Tag({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 12, padding: '3px 10px', borderRadius: 99,
        background: bg, color, fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>(MOCK_APPLICANTS);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | '全部'>('全部');
  const [sortBy, setSortBy]             = useState<SortKey>('match');
  const [selected, setSelected]         = useState<Applicant | null>(null);
  const [highlightId, setHighlightId]   = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setCardRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(id, el);
    else cardRefs.current.delete(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = sessionStorage.getItem('highlightApp');
    if (!id) return;
    sessionStorage.removeItem('highlightApp');
    setHighlightId(id);
    // Scroll after a short paint delay
    setTimeout(() => {
      const el = cardRefs.current.get(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }, []);

  const STATUS_TABS: (Status | '全部')[] = ['全部', '待审核', '已通过', '已拒绝'];

  const filtered = useMemo(() => {
    let list = applicants.filter((a) => {
      if (search && !a.name.includes(search)) return false;
      if (statusFilter !== '全部' && a.status !== statusFilter) return false;
      return true;
    });
    if (sortBy === 'match')     list = [...list].sort((a, b) => b.matchScore - a.matchScore);
    if (sortBy === 'time')      list = [...list].sort((a, b) => a.appliedAt.localeCompare(b.appliedAt));
    if (sortBy === 'composite') list = [...list].sort((a, b) => b.compositeScore - a.compositeScore);
    return list;
  }, [applicants, search, statusFilter, sortBy]);

  function handleUpdateStatus(id: string, status: Status) {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }

  const counts = useMemo(() => ({
    全部:   applicants.length,
    待审核: applicants.filter((a) => a.status === '待审核').length,
    已通过: applicants.filter((a) => a.status === '已通过').length,
    已拒绝: applicants.filter((a) => a.status === '已拒绝').length,
  }), [applicants]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F7FF' }}>
      <Navbar title="申请人列表" />

      {/* ── Filter bar ── */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          backgroundColor: '#F8F7FF',
          borderBottom: '1px solid #EDE9FF',
          padding: '12px 16px 8px',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', borderRadius: 12,
            padding: '0 12px', border: '1.5px solid #EDE9FF',
            marginBottom: 10,
          }}
        >
          <span style={{ color: '#9B8EC4', fontSize: 15 }}>🔍</span>
          <input
            type="text"
            placeholder="搜索姓名…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '10px 4px', border: 'none', outline: 'none',
              fontSize: 14, color: '#1A1240', background: 'transparent',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: '#9B8EC4', cursor: 'pointer', border: 'none', background: 'none', fontSize: 16 }}>✕</button>
          )}
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto' }}>
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                flexShrink: 0,
                padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: statusFilter === s ? 'none' : '1.5px solid #DDD8FF',
                background: statusFilter === s ? '#534AB7' : '#fff',
                color: statusFilter === s ? '#fff' : '#6B5FA6',
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {s} {counts[s as keyof typeof counts] !== undefined ? `(${counts[s as keyof typeof counts]})` : ''}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#9B8EC4', flexShrink: 0 }}>排序：</span>
          {([['match', '匹配度'], ['time', '申请时间'], ['composite', '综合评分']] as [SortKey, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                border: sortBy === k ? 'none' : '1px solid #DDD8FF',
                background: sortBy === k ? '#EDE9FF' : '#fff',
                color: sortBy === k ? '#534AB7' : '#9B8EC4',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      <main style={{ padding: '12px 16px 40px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60, color: '#9B8EC4' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14 }}>没有符合条件的申请人</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((a) => {
              const st = STATUS_STYLES[a.status];
              const isHighlighted = a.id === highlightId;
              return (
                <div
                  key={a.id}
                  ref={setCardRef(a.id)}
                  style={{
                    background: isHighlighted ? '#F0EEFF' : '#fff',
                    borderRadius: 16,
                    padding: '14px 14px',
                    border: isHighlighted ? '2px solid #534AB7' : '1.5px solid #EDE9FF',
                    boxShadow: isHighlighted
                      ? '0 0 0 4px rgba(83,74,183,0.12)'
                      : '0 1px 4px rgba(83,74,183,0.06)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                    <Avatar name={a.name} size={44} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1240' }}>{a.name}</span>
                        <span
                          style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600,
                            background: st.bg, color: st.color,
                            display: 'flex', alignItems: 'center', gap: 3,
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                          {a.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#9B8EC4' }}>{a.grade} · {a.major}</p>

                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <Tag text={a.mbti} bg={mbtiColor(a.mbti)} color="#534AB7" />
                        <Tag text={a.zodiac} bg="#FEF9C3" color="#854D0E" />
                      </div>
                    </div>

                    {/* Match score */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#534AB7', lineHeight: 1 }}>
                        {a.matchScore}<span style={{ fontSize: 12, fontWeight: 500 }}>%</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#9B8EC4' }}>匹配度</div>
                    </div>
                  </div>

                  {/* AI one-liner */}
                  <div
                    style={{
                      background: '#F5F3FF', borderRadius: 8,
                      padding: '7px 10px', marginBottom: 10,
                      fontSize: 13, color: '#3C3489',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span
                      style={{
                        background: '#EEEDFE', color: '#534AB7',
                        fontSize: 11, borderRadius: 6,
                        padding: '2px 6px', fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      AI 总结
                    </span>
                    {a.aiOneLiner}
                  </div>

                  {/* Applied at + button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: '#C4BAEC' }}>申请于 {a.appliedAt}</span>
                    <button
                      onClick={() => setSelected(a)}
                      style={{
                        padding: '7px 16px', borderRadius: 10,
                        border: '1.5px solid #534AB7', background: '#F5F3FF',
                        color: '#534AB7', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Drawer ── */}
      {selected && (
        <Drawer
          applicant={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={(id, status) => {
            handleUpdateStatus(id, status);
          }}
        />
      )}
    </div>
  );
}
