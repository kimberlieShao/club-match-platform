'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

interface NavbarProps {
  /** Legacy single-language title (still works). */
  title?: string;
  /** Preferred: bilingual titles — Navbar picks based on current language. */
  titleZh?: string;
  titleEn?: string;
}

export default function Navbar({ title, titleZh, titleEn }: NavbarProps) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<{ name?: string } | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayTitle = (language === 'en' ? titleEn : titleZh) ?? title ?? '';

  useEffect(() => {
    const raw = localStorage.getItem('studentProfile');
    if (raw) setProfile(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem('studentProfile');
    setProfile(null);
    setOpen(false);
    window.location.reload();
  };

  const initial = profile?.name ? profile.name[0] : '';

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#F0EEFF] px-4 py-3 flex items-center justify-between">
      {/* Left: back button */}
      <button
        onClick={() => router.back()}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0EEFF] transition-colors text-[#534AB7] text-lg"
      >
        ←
      </button>

      {/* Center: title */}
      <span className="font-semibold text-[#1A1240] text-base">{displayTitle}</span>

      {/* Right: language toggle · bell · avatar */}
      <div className="flex items-center gap-1.5">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className="text-xs font-semibold px-2 py-1 rounded-lg border border-[#534AB7] text-[#534AB7] hover:bg-[#F0EEFF] transition-colors"
        >
          {language === 'zh' ? 'EN' : '中文'}
        </button>

        {/* Bell */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0EEFF] transition-colors text-[#534AB7] text-base">
          🔔
        </button>

        {/* Avatar + dropdown */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{
              width: 32, height: 32,
              background: profile ? '#534AB7' : '#EDE9FF',
              border: 'none', cursor: 'pointer',
            }}
          >
            {profile ? (
              <span className="text-white text-sm font-bold">{initial}</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#9B8EC4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-[#F0EEFF] min-w-[164px] py-1.5 z-50">
              {profile ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-[#1A1240] truncate">{profile.name}</p>
                  </div>
                  <div className="border-t border-[#F0EEFF] my-0.5" />
                  <Link
                    href="/student/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1240] hover:bg-[#F5F3FF]"
                  >
                    👤 {language === 'en' ? 'My Profile' : '个人资料'}
                  </Link>
                  <Link
                    href="/student/my-applications"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1240] hover:bg-[#F5F3FF]"
                  >
                    📋 {language === 'en' ? 'My Applications' : '我的申请'}
                  </Link>
                  <div className="border-t border-[#F0EEFF] my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    {language === 'en' ? 'Sign Out' : '退出登录'}
                  </button>
                </>
              ) : (
                <Link
                  href="/student/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#534AB7] hover:bg-[#F5F3FF]"
                >
                  🔑 {language === 'en' ? 'Sign In' : '登录'}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
