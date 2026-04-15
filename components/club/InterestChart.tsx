'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '@/lib/i18n';

const VIEW_COUNTS: Record<string, number> = {
  Mon: 24, Tue: 31, Wed: 18, Thu: 45, Fri: 38, Sat: 62, Sun: 41,
};
const DAY_ZH: Record<string, string> = {
  Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日',
};

export default function InterestChart() {
  const { language } = useLanguage();
  const data = Object.entries(VIEW_COUNTS).map(([key, count]) => ({
    day: language === 'en' ? key : DAY_ZH[key],
    count,
  }));

  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9B8EC4' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          formatter={(value: unknown) =>
            language === 'en'
              ? [`${value}`, 'Views'] as [string, string]
              : [`${value}`, '浏览量'] as [string, string]
          }
        />
        <Line type="monotone" dataKey="count" stroke="#A78BFA" strokeWidth={2.5} dot={{ fill: '#A78BFA', r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
