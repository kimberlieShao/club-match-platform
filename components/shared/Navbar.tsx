'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<{ name?: string } | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const { language, setLanguage } = useLanguage();
  const initial = profile?.name ? profile.name[0] : '';

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#F0EEFF] px-4 py-3 flex items-center justify-between">
      <button
        onClick={() => router.back()}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0EEFF] transition-colors text-[#534AB7] text-lg"
      >
        ←
      </button>
      <span className="font-semibold text-[#1A1240] text-base">{title}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
          className="text-xs font-semibold px-2 py-1 rounded-lg border border-[#534AB7] text-[#534AB7] hover:bg-[#F0EEFF] transition-colors"
        >
          {language === 'zh' ? 'EN' : '中文'}
        </button>
        <Link href="/">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F0EEFF] transition-colors text-[#534AB7] text-lg">
            ⌂
          </div>
        </Link>
        {profile ? (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: '#534AB7' }}
              className="text-white text-sm font-bold flex items-center justify-center"
            >
              {initial}
            </button>
            {open && (
              <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-[#F0EEFF] min-w-[148px] py-1.5 z-50">
                <Link
                  href="/student/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1240] hover:bg-[#F5F3FF]"
                >
                  👤 个人资料
                </Link>
                <Link
                  href="/student/my-applications"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A1240] hover:bg-[#F5F3FF]"
                >
                  📋 我的申请
                </Link>
                <div className="border-t border-[#F0EEFF] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/student/login"
            className="text-sm text-[#534AB7] font-semibold px-3 py-1.5 rounded-xl hover:bg-[#F0EEFF]"
          >
            登录
          </Link>
        )}
      </div>
    </div>
  );
}
