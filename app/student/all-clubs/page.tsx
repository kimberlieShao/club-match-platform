'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockClubs } from '@/lib/mockData';
import Navbar from '@/components/shared/Navbar';
import { useLanguage } from '@/lib/i18n';

const CATEGORIES = ['全部', '文艺', '体育', '学术', '公益', '科技'] as const;

const CATEGORY_LABELS_ZH: Record<string, string> = {
  '全部': '全部', '文艺': '文艺', '体育': '体育', '学术': '学术', '公益': '公益', '科技': '科技',
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  '全部': 'All', '文艺': 'Arts', '体育': 'Sports', '学术': 'Academic', '公益': 'Community', '科技': 'Tech',
};

const categoryColors: Record<string, string> = {
  文艺: 'bg-pink-100 text-pink-700',
  科技: 'bg-blue-100 text-blue-700',
  体育: 'bg-green-100 text-green-700',
  学术: 'bg-yellow-100 text-yellow-700',
  公益: 'bg-orange-100 text-orange-700',
};

export default function AllClubsPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const isEn = language === 'en';
  const catLabels = isEn ? CATEGORY_LABELS_EN : CATEGORY_LABELS_ZH;

  const filtered = useMemo(() => {
    return mockClubs.filter((club) => {
      const matchesCategory = activeCategory === '全部' || club.category === activeCategory;
      const matchesSearch =
        !search.trim() ||
        club.name.includes(search) ||
        (club.nameEn ?? '').toLowerCase().includes(search.toLowerCase()) ||
        club.description.includes(search) ||
        club.tags.some((t) => t.includes(search));
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE9FF] to-[#F5F3FF] flex flex-col">
      <Navbar titleZh="全部社团" titleEn="All Clubs" />

      <main className="flex-1 px-4 py-5">
        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8EC4] text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? 'Search clubs by name or tag...' : '搜索社团名称、标签...'}
            className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl border border-[#E5DEFF] text-[#1A1240] focus:outline-none focus:border-[#534AB7] text-sm shadow-sm"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#534AB7] text-white'
                  : 'bg-white text-[#6B5FA6] border border-[#E5DEFF]'
              }`}
            >
              {catLabels[cat] ?? cat}
            </button>
          ))}
        </div>

        <p className="text-xs text-[#9B8EC4] mb-3">{isEn ? `${filtered.length} clubs` : `共 ${filtered.length} 个社团`}</p>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((club) => (
            <Link key={club.id} href={`/student/club/${club.id}`}>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#F0EEFF] hover:shadow-md transition-shadow h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#1A1240] text-sm leading-tight">{isEn ? (club.nameEn ?? club.name) : club.name}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-1 ${categoryColors[club.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {isEn ? (CATEGORY_LABELS_EN[club.category] ?? club.category) : club.category}
                  </span>
                </div>

                <p className="text-[#6B5FA6] text-xs leading-relaxed mb-3 line-clamp-2">{language === 'en' ? (club.descriptionEn ?? club.description) : club.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(isEn ? (club.tagsEn ?? club.tags) : club.tags).slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-[#EDE9FF] text-[#534AB7] px-1.5 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[#9B8EC4]">
                  <span>👥 {club.memberCount}{isEn ? ' members' : '人'}</span>
                  <span>⭐ {club.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔎</p>
            <p className="text-[#6B5FA6] font-medium">{isEn ? 'No clubs found' : '没有找到相关社团'}</p>
            <p className="text-[#9B8EC4] text-sm mt-1">{isEn ? 'Try different keywords or categories' : '试试其他关键词或分类'}</p>
          </div>
        )}
      </main>
    </div>
  );
}
