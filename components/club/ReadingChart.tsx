'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const articleData = [
  { title: '招新啦', reads: 320 },
  { title: '年度大戏', reads: 540 },
  { title: '排练花絮', reads: 210 },
  { title: '会员专访', reads: 180 },
  { title: '活动回顾', reads: 290 },
];

export default function ReadingChart() {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={articleData} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEFF" vertical={false} />
        <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#9B8EC4' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
        <Bar dataKey="reads" fill="#534AB7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
