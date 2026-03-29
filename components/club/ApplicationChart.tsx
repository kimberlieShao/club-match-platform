'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DataPoint { day: string; count: number; }

interface Props {
  data: DataPoint[];
  selectedDay: string | null;
  onDayClick: (data: { activeLabel?: string } | null) => void;
}

export default function ApplicationChart({ data, selectedDay, onDayClick }: Props) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart
        data={data}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(d: any) => onDayClick(d as { activeLabel?: string } | null)}
        style={{ cursor: 'pointer' }}
      >
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9B8EC4' }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          formatter={(v: number) => [`${v} 人`, '申请数'] as [string, string]}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#534AB7"
          strokeWidth={2.5}
          activeDot={{ r: 6, fill: '#534AB7' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dot={(props: any) => {
            const { cx, cy, payload } = props;
            const isSelected = payload.day === selectedDay;
            if (isSelected) {
              return (
                <g key={`dot-${payload.day}`}>
                  <circle cx={cx} cy={cy} r={12} fill="#EDE9FF" stroke="#534AB7" strokeWidth={2} />
                  <circle cx={cx} cy={cy} r={5} fill="#534AB7" />
                </g>
              );
            }
            return <circle key={`dot-${payload.day}`} cx={cx} cy={cy} r={3} fill="#534AB7" />;
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
