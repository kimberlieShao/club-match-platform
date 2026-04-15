'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useLanguage } from '@/lib/i18n';

const ARTICLES = [
  { zh: '招新啦',   en: 'Recruitment',       reads: 320 },
  { zh: '年度大戏', en: 'Annual Show',        reads: 540 },
  { zh: '排练花絮', en: 'Rehearsal BTS',      reads: 210 },
  { zh: '会员专访', en: 'Member Interview',   reads: 180 },
  { zh: '活动回顾', en: 'Event Recap',        reads: 290 },
];

export default function ReadingChart() {
  const { language } = useLanguage();
  const data = ARTICLES.map((a) => ({
    title: language === 'en' ? a.en : a.zh,
    reads: a.reads,
  }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" vertical={false} />
        <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#9B8EC4' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          formatter={(value: unknown) =>
            language === 'en'
              ? [`${value}`, 'Reads'] as [string, string]
              : [`${value}`, '阅读量'] as [string, string]
          }
        />
        <Bar dataKey="reads" fill="#534AB7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
