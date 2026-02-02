import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ score }) => {
  const data = [{ name: 'Score', value: score }];

  let color = '#ef4444'; // red
  if (score >= 50) color = '#eab308'; // yellow
  if (score >= 75) color = '#22c55e'; // green

  return (
    <div className="relative h-48 w-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={30 / 2}
            fill={color}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="text-5xl font-black text-slate-800 tracking-tighter">{score}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Accuracy Score</span>
      </div>
    </div>
  );
};
