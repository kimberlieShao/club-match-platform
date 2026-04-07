'use client';

import { useState, useEffect, use } from 'react';
import { mockClubs } from '@/lib/mockData';
import { notFound, useRouter } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import { ReviewRatings } from '@/lib/types';
import { containsBadWords } from '@/lib/badWords';
import { useLanguage } from '@/lib/i18n';

const applyText = {
  zh: {
    title: '申请加入',
    autoFill: '自动填入的信息',
    mbti: 'MBTI', constellation: '星座',
    reason: '申请理由', reasonPlaceholder: '说说你为什么想加入这个社团...',
    noResume: '未上传简历（可在个人资料页上传）',
    submitBtn: '一键发送申请 →',
    fieldName: '姓名', fieldStudentId: '学号', fieldMajor: '专业', fieldGrade: '年级',
    successTitle: '申请已提交！',
    successBody1: '我们已收到你对',
    successBody2: '的申请',
    successBody3: '预计3个工作日内回复',
    viewApps: '查看我的申请 →',
    keepExploring: '继续看其他社团 →',
    aiWriting: '生成中…', aiWrite: '✨ AI 帮我写',
    uploadedResume: '已上传的简历',
  },
  en: {
    title: 'Apply to Join',
    autoFill: 'Your info (auto-filled)',
    mbti: 'MBTI', constellation: 'Zodiac Sign',
    reason: 'Why do you want to join?',
    reasonPlaceholder: "Tell us why you'd be a great fit...",
    noResume: 'No resume uploaded (add one in your profile)',
    submitBtn: 'Submit Application →',
    fieldName: 'Name', fieldStudentId: 'Student ID', fieldMajor: 'Major', fieldGrade: 'Year',
    successTitle: 'Application Submitted!',
    successBody1: "We've received your application to",
    successBody2: '',
    successBody3: 'Usually hear back within 3 business days',
    viewApps: 'View My Applications →',
    keepExploring: 'Keep Exploring →',
    aiWriting: 'Generating…', aiWrite: '✨ AI Write for Me',
    uploadedResume: 'Uploaded resume',
  },
};

const text = {
  zh: {
    members: '名成员', hoursPerWeek: '每周投入', rating: '综合评分',
    president: '社长',
    aboutUs: '关于我们', recentActivities: '近年活动',
    reviews: '成员评价', writeReview: '写评价',
    verifiedMember: '已验证成员', helpful: '有帮助',
    followUs: '关注我们',
    applyBtn: '申请加入 →', appliedBtn: '已申请，等待审核',
    reviewDims: { vibe: '整体氛围', time: '时间合理', events: '活动质量', leadership: '管理水平', beginner: '新手友好' },
    socialMedia: { wechat: '公众号', xiaohongshu: '小红书', douyin: '抖音', weibo: '微博' },
  },
  en: {
    members: 'members', hoursPerWeek: 'hrs/week', rating: 'Rating',
    president: 'President',
    aboutUs: 'About Us', recentActivities: 'Recent Events',
    reviews: 'Member Reviews', writeReview: 'Write a Review',
    verifiedMember: 'Verified Member', helpful: 'Helpful',
    followUs: 'Find Us Online',
    applyBtn: 'Apply to Join →', appliedBtn: 'Applied — Pending Review',
    reviewDims: { vibe: 'Vibe', time: 'Time Commitment', events: 'Events', leadership: 'Leadership', beginner: 'Beginner Friendly' },
    socialMedia: { wechat: 'WeChat', xiaohongshu: 'Instagram', douyin: 'TikTok', weibo: 'Twitter' },
  },
};

const RATING_BG_COLOR: { key: keyof ReviewRatings; dimKey: 'vibe' | 'time' | 'events' | 'leadership' | 'beginner'; bg: string; color: string }[] = [
  { key: 'atmosphere',     dimKey: 'vibe',       bg: '#FFD6E0', color: '#C2506A' },
  { key: 'timeValue',      dimKey: 'time',       bg: '#D6F5E3', color: '#3A8A5A' },
  { key: 'activity',       dimKey: 'events',     bg: '#FFF3CD', color: '#A07820' },
  { key: 'management',     dimKey: 'leadership', bg: '#D6EEFF', color: '#3A6EA8' },
  { key: 'newbieFriendly', dimKey: 'beginner',   bg: '#EDE0FF', color: '#7040B0' },
];

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { language } = useLanguage();
  const t = language === 'en' ? text.en : text.zh;
  const at = language === 'en' ? applyText.en : applyText.zh;

  const club = mockClubs.find((c) => c.id === id);
  if (!club) notFound();

  // RATING_LABELS with localized text
  const RATING_LABELS = RATING_BG_COLOR.map(({ key, dimKey, bg, color }) => ({
    key,
    label: t.reviewDims[dimKey],
    bg,
    color,
  }));

  // Review state
  const [reviews, setReviews] = useState(club.reviews);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [studentId, setStudentId] = useState('');
  const [enrollYear, setEnrollYear] = useState('2023');
  const [confirmed, setConfirmed] = useState(false);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [ratings, setRatings] = useState<ReviewRatings>({
    atmosphere: 3, timeValue: 3, activity: 3, management: 3, newbieFriendly: 3,
  });
  const [moderating, setModerating] = useState(false);
  const [moderateError, setModerateError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [badWordError, setBadWordError] = useState(false);

  // Application modal state
  const [showApplyModal, setShowApplyModal]   = useState(false);
  const [applyReason, setApplyReason]         = useState('');
  const [applyMbti, setApplyMbti]             = useState('');
  const [applyZodiac, setApplyZodiac]         = useState('');
  const [applyLoading, setApplyLoading]       = useState(false);
  const [applySuccess, setApplySuccess]       = useState(false);
  const [applyCopilotLoading, setApplyCopilotLoading] = useState(false);
  const [storedProfile, setStoredProfile]     = useState<Record<string, string>>({});
  const [alreadyApplied, setAlreadyApplied]   = useState<string | null>(null);

  const MBTI_LIST   = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'];
  const ZODIAC_LIST = ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'];

  useEffect(() => {
    const raw = localStorage.getItem('studentProfile');
    if (raw) {
      const p = JSON.parse(raw);
      setStoredProfile(p);
      setApplyMbti(p.mbti || '');
      setApplyZodiac(p.zodiac || '');
    }
    const apps = JSON.parse(localStorage.getItem('myApplications') || '[]');
    const existing = apps.find((a: { clubId: string; appliedAt: string }) => a.clubId === club.id);
    if (existing) setAlreadyApplied(existing.appliedAt);
  }, [club.id]);

  const avgRating = (r: ReviewRatings) =>
    ((r.atmosphere + r.timeValue + r.activity + r.management + r.newbieFriendly) / 5).toFixed(1);

  const handleAuthNext = () => {
    if (authStep === 1 && studentId.trim()) setAuthStep(2);
  };

  const handleAuthConfirm = () => {
    if (confirmed) {
      setShowAuthModal(false);
      setShowReviewModal(true);
      setAuthStep(1);
    }
  };

  const handleReviewTextChange = (text: string) => {
    if (text.length <= 300) {
      setReviewText(text);
      setBadWordError(containsBadWords(text));
    }
  };

  const handleSubmitReview = async () => {
    if (reviewText.length < 20 || badWordError) return;
    setModerating(true);
    setModerateError('');
    try {
      const res = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reviewText }),
      });
      const data = await res.json();
      if (!data.pass) {
        setModerateError(data.reason || '评价包含不当内容，请修改后重新提交');
        setModerating(false);
        return;
      }
    } catch {
      // If moderation API fails, allow submission
    }
    setModerating(false);
    const newReview = {
      id: `user-${Date.now()}`,
      anonymous: true,
      verified: true,
      enrollYear: parseInt(enrollYear),
      content: reviewText,
      ratings,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0,
    };
    setReviews((prev) => [newReview, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setSubmitted(false);
      setReviewText('');
      setBadWordError(false);
      setRatings({ atmosphere: 3, timeValue: 3, activity: 3, management: 3, newbieFriendly: 3 });
    }, 2000);
  };

  const handleApplySubmit = () => {
    setApplyLoading(true);
    setTimeout(() => {
      const appliedAt = new Date().toISOString();
      const apps = JSON.parse(localStorage.getItem('myApplications') || '[]');
      apps.push({
        clubName: club.name, clubNameEn: club.nameEn ?? club.name, clubId: club.id,
        appliedAt,
        status: '待审核',
        aiSummary: storedProfile.aiStrengthSummary || '',
        reason: applyReason,
        mbti: applyMbti, zodiac: applyZodiac,
      });
      localStorage.setItem('myApplications', JSON.stringify(apps));
      setAlreadyApplied(appliedAt);
      setApplyLoading(false);
      setApplySuccess(true);
    }, 800);
  };

  const handleApplyCopilot = async () => {
    setApplyCopilotLoading(true);
    try {
      const msg = `请帮我写一段约50字的申请理由，说明为什么想加入${club.name}，语气真诚。用户信息：${storedProfile.major || '同学'}，${storedProfile.grade || ''}。`;
      const res  = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, clubId: club.id }) });
      const data = await res.json();
      setApplyReason(data.reply || applyReason);
    } catch { /* keep existing */ }
    setApplyCopilotLoading(false);
  };

  const handleLike = (reviewId: string) => {
    if (likedIds.has(reviewId)) return;
    setLikedIds((prev) => new Set([...prev, reviewId]));
    setReviews((prev) =>
      prev.map((r) => r.id === reviewId ? { ...r, likes: (r.likes ?? 0) + 1 } : r)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar title={language === 'en' ? (club.nameEn ?? club.name) : club.name} />

      <main className="flex-1 pb-10">
        {/* Hero Banner */}
        <div className="bg-[#534AB7] px-4 pt-6 pb-12">
          <h1 className="text-3xl font-bold text-white">{language === 'en' ? (club.nameEn ?? club.name) : club.name}</h1>
          <p className="text-purple-200 text-sm mt-1">
            {club.category} · {club.memberCount}{language === 'en' ? ` ${t.members}` : t.members}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-yellow-300">★</span>
            <span className="text-white font-semibold">{club.rating}</span>
            <span className="text-purple-200 text-sm">/ 5.0</span>
          </div>
        </div>

        <div className="px-4 -mt-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-4 shadow-md mb-4">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: t.members,      value: language === 'en' ? club.memberCount : `${club.memberCount}人` },
                { label: t.hoursPerWeek, value: `${club.weeklyHours}h` },
                { label: t.rating,       value: club.rating },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-[#534AB7] font-bold text-xl">{stat.value}</p>
                  <p className="text-[#9B8EC4] text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
            {club.president && (
              <div className="border-t border-[#F0EEFF] pt-2.5 flex items-center gap-2">
                <span className="text-xs text-[#9B8EC4]">{t.president}</span>
                <span className="text-xs font-medium text-[#1A1240]">{club.president}</span>
                {club.presidentContact && (
                  <span className="text-xs text-[#9B8EC4] ml-1">{club.presidentContact}</span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-[#1A1240] mb-2">{t.aboutUs}</h2>
            <p className="text-[#4A4A6A] text-sm leading-relaxed">{language === 'en' ? (club.descriptionEn ?? club.description) : club.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {club.tags.map((tag) => (
                <span key={tag} className="text-xs bg-[#EDE9FF] text-[#534AB7] px-2 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-[#1A1240] mb-3">{t.recentActivities}</h2>
            <div className="flex flex-col gap-3">
              {club.activities.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <div className="w-1 bg-[#534AB7] rounded-full shrink-0" />
                  <div>
                    <p className="font-medium text-[#1A1240] text-sm">{language === 'en' ? (act.titleEn ?? act.title) : act.title}</p>
                    <p className="text-[#9B8EC4] text-xs">{act.date} · {language === 'en' ? `${act.participants} participants` : `${act.participants}人参与`}</p>
                    <p className="text-[#4A4A6A] text-xs mt-0.5">{language === 'en' ? (act.descriptionEn ?? act.description) : act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1240]">{t.reviews}</h2>
              <button
                onClick={() => { setShowAuthModal(true); setAuthStep(1); setConfirmed(false); setStudentId(''); }}
                className="text-xs bg-[#534AB7] text-white px-3 py-1.5 rounded-full"
              >
                ✏️ {t.writeReview}
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-[#F0EEFF] pb-5 last:border-0 last:pb-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {review.verified && (
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{t.verifiedMember}</span>
                      )}
                      {review.enrollYear && (
                        <span className="text-xs text-[#9B8EC4]">
                          {language === 'en' ? `Class of ${review.enrollYear}` : `${review.enrollYear}届成员`}
                        </span>
                      )}
                    </div>
                    <span className="text-[#534AB7] font-semibold text-sm">★ {avgRating(review.ratings)}</span>
                  </div>

                  {/* Rating chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {RATING_LABELS.map(({ key, label, bg, color }) => (
                      <span
                        key={key}
                        style={{ background: bg, color, fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 500 }}
                      >
                        {label} {review.ratings[key]}
                      </span>
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-[#4A4A6A] text-sm leading-relaxed mb-2">{review.content}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#C0B8E0] text-xs">{review.createdAt}</span>
                    <button
                      onClick={() => handleLike(review.id)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                        likedIds.has(review.id) ? 'bg-[#EDE9FF] text-[#534AB7]' : 'text-[#9B8EC4] hover:bg-[#F5F3FF]'
                      }`}
                    >
                      👍 {t.helpful} {(review.likes ?? 0) + (likedIds.has(review.id) ? 1 : 0)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          {club.socialMedia && Object.keys(club.socialMedia).length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <h2 className="font-semibold text-[#1A1240] mb-3">{t.followUs}</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(club.socialMedia).map(([platform, link]) => (
                  link ? (
                    <a
                      key={platform}
                      href={link.startsWith('http') ? link : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EDE9FF] text-[#534AB7] text-sm font-medium hover:bg-[#D4CEFF] transition-colors"
                    >
                      <span>{t.socialMedia[platform as keyof typeof t.socialMedia] ?? platform}</span>
                    </a>
                  ) : null
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          {alreadyApplied ? (
            <div>
              <p className="text-xs text-center text-[#9B8EC4] mb-2">
                你已于 {(() => { const d = new Date(alreadyApplied); return `${d.getMonth() + 1}月${d.getDate()}日`; })()} 提交申请
              </p>
              <button
                disabled
                className="w-full py-4 bg-[#E5E0F5] text-[#9B8EC4] font-semibold rounded-2xl cursor-not-allowed"
              >
                {t.appliedBtn}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowApplyModal(true); setApplySuccess(false); }}
              className="w-full py-4 bg-[#534AB7] text-white font-semibold rounded-2xl shadow-lg"
            >
              {t.applyBtn}
            </button>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1A1240] text-lg">身份验证</h3>
              <button onClick={() => setShowAuthModal(false)} className="text-[#9B8EC4] text-xl">×</button>
            </div>

            {authStep === 1 ? (
              <>
                <p className="text-sm text-[#6B5FA6] mb-4">请填写基本信息以验证你的成员资格（信息仅用于验证，不会公开）</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">学号</label>
                  <input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="请输入你的学号"
                    className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7]"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#4A4A6A] mb-1.5">入社年份</label>
                  <select
                    value={enrollYear}
                    onChange={(e) => setEnrollYear(e.target.value)}
                    className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] bg-white"
                  >
                    {[2024, 2023, 2022, 2021, 2020].map((y) => (
                      <option key={y} value={y}>{y}年</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAuthNext}
                  disabled={!studentId.trim()}
                  className="w-full py-4 bg-[#534AB7] text-white font-semibold rounded-2xl disabled:opacity-40"
                >
                  下一步
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-[#6B5FA6] mb-6">请确认你的成员资格</p>
                <button
                  onClick={() => setConfirmed(!confirmed)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all mb-6 ${
                    confirmed ? 'border-[#534AB7] bg-[#EDE9FF]' : 'border-[#E5DEFF]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${confirmed ? 'bg-[#534AB7] border-[#534AB7]' : 'border-[#C9C0F0]'}`}>
                      {confirmed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <p className="text-sm text-[#1A1240]">我确认曾正式加入该社团满一学期</p>
                  </div>
                </button>
                <button
                  onClick={handleAuthConfirm}
                  disabled={!confirmed}
                  className="w-full py-4 bg-[#534AB7] text-white font-semibold rounded-2xl disabled:opacity-40"
                >
                  进入评价
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end overflow-y-auto">
          <div className="bg-white rounded-t-3xl w-full p-6 max-h-[92vh] overflow-y-auto">
            {applySuccess ? (
              <div className="flex flex-col items-center py-10">
                <div
                  className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5"
                >
                  <span className="text-green-500 text-4xl font-bold">✓</span>
                </div>
                <p className="font-bold text-[#1A1240] text-xl text-center mb-2">{at.successTitle}</p>
                <p className="text-[#6B5FA6] text-sm text-center leading-relaxed mb-8">
                  {at.successBody1} <span className="font-medium text-[#534AB7]">{language === 'en' ? (club!.nameEn ?? club!.name) : club!.name}</span>{at.successBody2 && ` ${at.successBody2}`}<br />
                  {at.successBody3}
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => router.push('/student/my-applications')}
                    className="flex-1 py-3 rounded-2xl border font-semibold text-sm text-[#534AB7]"
                    style={{ borderColor: '#534AB7' }}
                  >
                    {at.viewApps}
                  </button>
                  <button
                    onClick={() => { setShowApplyModal(false); router.push('/student/recommendations'); }}
                    className="flex-1 py-3 rounded-2xl bg-[#534AB7] text-white font-semibold text-sm"
                  >
                    {at.keepExploring}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-[#1A1240] text-lg">{at.title} · {language === 'en' ? (club.nameEn ?? club.name) : club.name}</h3>
                  <button onClick={() => setShowApplyModal(false)} className="text-[#9B8EC4] text-2xl leading-none">×</button>
                </div>

                {/* Pre-filled info */}
                <div className="bg-[#F5F3FF] rounded-2xl p-4 mb-5">
                  <p className="text-xs text-[#9B8EC4] font-semibold mb-3 uppercase tracking-wide">{at.autoFill}</p>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-[#9B8EC4]">{at.fieldName}</span>
                    <span className="text-[#1A1240] font-medium">{storedProfile.name || '—'}</span>
                    <span className="text-[#9B8EC4]">{at.fieldStudentId}</span>
                    <span className="text-[#1A1240] font-medium">{storedProfile.studentId || '—'}</span>
                    <span className="text-[#9B8EC4]">{at.fieldMajor}</span>
                    <span className="text-[#1A1240] font-medium">{storedProfile.major || '—'}</span>
                    <span className="text-[#9B8EC4]">{at.fieldGrade}</span>
                    <span className="text-[#1A1240] font-medium">{storedProfile.grade || '—'}</span>
                  </div>
                </div>

                {/* MBTI + Zodiac */}
                <div className="flex gap-3 mb-5">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#9B8EC4] mb-1.5">{at.mbti}</label>
                    <select
                      value={applyMbti}
                      onChange={(e) => setApplyMbti(e.target.value)}
                      className="w-full border border-[#E5DEFF] rounded-xl px-3 py-2.5 text-sm text-[#1A1240] bg-white focus:outline-none focus:border-[#534AB7]"
                    >
                      <option value="">未知</option>
                      {MBTI_LIST.map((m) => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#9B8EC4] mb-1.5">{at.constellation}</label>
                    <select
                      value={applyZodiac}
                      onChange={(e) => setApplyZodiac(e.target.value)}
                      className="w-full border border-[#E5DEFF] rounded-xl px-3 py-2.5 text-sm text-[#1A1240] bg-white focus:outline-none focus:border-[#534AB7]"
                    >
                      <option value="">未知</option>
                      {ZODIAC_LIST.map((z) => <option key={z}>{z}</option>)}
                    </select>
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-[#1A1240]">{at.reason}</label>
                    <button
                      onClick={handleApplyCopilot}
                      disabled={applyCopilotLoading}
                      className="text-xs bg-[#F5F3FF] text-[#534AB7] border border-[#C9C0F0] px-2.5 py-1 rounded-lg font-semibold"
                    >
                      {applyCopilotLoading ? at.aiWriting : at.aiWrite}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={applyReason}
                    onChange={(e) => setApplyReason(e.target.value)}
                    placeholder={at.reasonPlaceholder}
                    className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-sm text-[#1A1240] focus:outline-none focus:border-[#534AB7] resize-none"
                  />
                </div>

                {/* Resume */}
                <div className="flex items-center gap-3 p-3 bg-[#F5F3FF] rounded-xl mb-6">
                  <span className="text-xl">📄</span>
                  <div className="flex-1 text-sm">
                    {storedProfile.resumeFileName
                      ? <><p className="font-medium text-[#1A1240]">{storedProfile.resumeFileName}</p><p className="text-[#9B8EC4] text-xs">{at.uploadedResume}</p></>
                      : <p className="text-[#9B8EC4]">{at.noResume}</p>
                    }
                  </div>
                </div>

                <button
                  onClick={handleApplySubmit}
                  disabled={applyLoading}
                  className="w-full py-4 bg-[#534AB7] text-white font-bold rounded-2xl text-base disabled:opacity-50"
                >
                  {applyLoading ? '发送中…' : at.submitBtn}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end overflow-y-auto">
          <div className="bg-white rounded-t-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {submitted ? (
              <div className="flex flex-col items-center py-10">
                <div className="text-5xl mb-4">🎉</div>
                <p className="font-bold text-[#1A1240] text-xl">感谢你的真实评价，已帮助3位同学</p>
                <p className="text-[#6B5FA6] text-sm mt-2">你的评价将继续帮助更多学弟学妹</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-[#1A1240] text-lg">{t.writeReview}</h3>
                  <button onClick={() => setShowReviewModal(false)} className="text-[#9B8EC4] text-xl">×</button>
                </div>

                <p className="text-xs text-[#9B8EC4] bg-[#F5F3FF] rounded-xl px-3 py-2 mb-3">
                  🔒 你的姓名和学号不会被公开，评价将以匿名形式展示
                </p>

                {/* Warm notice */}
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-3 py-2.5 mb-5">
                  <p className="text-xs text-[#92400E] leading-relaxed">
                    💛 温馨提示：评价将帮助学弟学妹做决定，请保持友善理性。恶语伤人心，真诚的评价才最有价值。
                  </p>
                </div>

                {/* Star ratings */}
                <div className="mb-5">
                  <p className="font-semibold text-[#1A1240] text-sm mb-3">各维度评分</p>
                  <div className="flex flex-col gap-3">
                    {RATING_LABELS.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="text-sm text-[#4A4A6A] w-20 shrink-0">{label}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRatings((prev) => ({ ...prev, [key]: star }))}
                              className={`text-xl transition-transform hover:scale-110 ${star <= ratings[key] ? 'text-yellow-400' : 'text-gray-200'}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-[#534AB7] font-semibold ml-1">{ratings[key]}.0</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-[#1A1240] text-sm">文字评价</p>
                    <span className={`text-xs ${reviewText.length > 280 ? 'text-red-500' : 'text-[#9B8EC4]'}`}>
                      {reviewText.length}/300
                    </span>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => handleReviewTextChange(e.target.value)}
                    rows={4}
                    placeholder="分享你的真实感受，帮助学弟学妹做决定"
                    className="w-full border border-[#E5DEFF] rounded-xl px-4 py-3 text-[#1A1240] focus:outline-none focus:border-[#534AB7] resize-none text-sm"
                  />
                  {badWordError && (
                    <p className="text-xs text-red-500 mt-1">包含不当词汇，请修改后提交</p>
                  )}
                  {!badWordError && reviewText.length < 20 && reviewText.length > 0 && (
                    <p className="text-xs text-orange-500 mt-1">至少需要20个字</p>
                  )}
                </div>

                {moderateError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-sm">⚠️ 评价审核未通过：{moderateError}，请修改后重新提交</p>
                  </div>
                )}

                <button
                  onClick={handleSubmitReview}
                  disabled={reviewText.length < 20 || moderating || badWordError}
                  className="w-full py-4 bg-[#534AB7] text-white font-semibold rounded-2xl disabled:opacity-40"
                >
                  {moderating ? '审核中...' : '提交评价'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
