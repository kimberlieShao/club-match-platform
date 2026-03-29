'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const viewData = [
  { day: '周一', count: 24 },
  { day: '周二', count: 31 },
  { day: '周三', count: 18 },
  { day: '周四', count: 45 },
  { day: '周五', count: 38 },
  { day: '周六', count: 62 },
  { day: '周日', count: 41 },
];

export default function InterestChart() {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={viewData}>
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9B8EC4' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
        <Line type="monotone" dataKey="count" stroke="#A78BFA" strokeWidth={2.5} dot={{ fill: '#A78BFA', r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
