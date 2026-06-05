'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Bike, Footprints, Flame, TrendingUp, Zap, Heart } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Activity {
  id: string;
  name: string;
  type: string;
  date: string;
  distanceKm: number;
  movingTimeMin: number;
  avgSpeedKmh: number;
  calories: number;
  elevationM: number;
  kudos: number;
  prs: number;
  performance?: {
    hasHeartrate: boolean;
    hasDeviceWatts: boolean;
    avgHeartrate: number | null;
    maxHeartrate: number | null;
    avgWatts: number | null;
    avgCadence: number;
    powerBests: Record<string, number>;
  };
}

interface StravaData {
  athlete: { name: string; location: string };
  period: { from: string; to: string };
  totals: { activities: number; distanceKm: number; movingTimeMin: number; calories: number; elevationM: number; avgWatts?: number };
  byType: { type: string; count: number; distanceKm: number }[];
  activities: Activity[];
}

const sportIcon = (type: string) =>
  type === 'Ride' || type === 'VirtualRide' ? <Bike size={14} /> : <Footprints size={14} />;

export default function StravaWidget() {
  const [data, setData] = useState<StravaData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API}/artifacts/strava-weekly/outputs/latest`)
      .then(r => r.json())
      .then(json => setData(json.data))
      .catch(() => setError(true));
  }, []);

  if (error) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-zinc-500 text-sm">
      Sin datos de Strava todavía. Pídele a Claude que corra el artefacto.
    </div>
  );

  if (!data) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse h-48" />
  );

  const chartData = data.activities.map(a => ({
    name: new Date(a.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
    km: a.distanceKm,
    watts: a.performance?.avgWatts ?? 0,
  }));

  const stats = [
    { label: 'Distancia', value: `${data.totals.distanceKm} km`, icon: <TrendingUp size={16} className="text-orange-400" /> },
    { label: 'Tiempo', value: `${Math.floor(data.totals.movingTimeMin / 60)}h ${data.totals.movingTimeMin % 60}min`, icon: <Bike size={16} className="text-orange-400" /> },
    { label: 'Calorías', value: data.totals.calories.toLocaleString(), icon: <Flame size={16} className="text-orange-400" /> },
    { label: 'Desnivel', value: `${data.totals.elevationM} m`, icon: <TrendingUp size={16} className="text-orange-400" /> },
    ...(data.totals.avgWatts ? [{ label: 'Vatios avg', value: `${data.totals.avgWatts}W`, icon: <Zap size={16} className="text-orange-400" /> }] : []),
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <span className="text-orange-500">⚡</span> Strava — Esta semana
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {new Date(data.period.from).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} → {new Date(data.period.to).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </p>
        </div>
        <div className="flex gap-2">
          {data.byType.map(t => (
            <span key={t.type} className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
              {sportIcon(t.type)} {t.count}x {t.type}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">{s.icon}{s.label}</div>
            <div className="text-white font-semibold text-lg">{s.value}</div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Bar dataKey="km" name="Km" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="watts" name="Vatios" fill="#fb923c50" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-2">
        {data.activities.map(a => (
          <div key={a.id} className="flex items-center gap-3 text-sm bg-zinc-800/30 rounded-lg px-3 py-2">
            <span className="text-zinc-400">{sportIcon(a.type)}</span>
            <span className="flex-1 text-zinc-300 truncate">{a.name}</span>
            <span className="text-zinc-400 text-xs">{a.distanceKm} km</span>
            {a.performance?.avgWatts && (
              <span className="text-zinc-400 text-xs flex items-center gap-0.5">
                <Zap size={10} />{a.performance.avgWatts}W
              </span>
            )}
            {a.performance?.avgHeartrate && (
              <span className="text-zinc-400 text-xs flex items-center gap-0.5">
                <Heart size={10} />{a.performance.avgHeartrate}
              </span>
            )}
            {a.prs > 0 && (
              <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded-full">
                {a.prs} PRs
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
