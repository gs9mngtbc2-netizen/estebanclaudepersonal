'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Bike, Footprints, Flame, TrendingUp, Trophy, Mountain } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RecentActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  distanceKm: number;
  movingTimeMin: number;
  calories: number;
  elevationM: number;
  kudos: number;
  prs: number;
}

interface StravaOverview {
  athlete: { name: string; location: string };
  period: { from: string; to: string; totalActivitiesFetched: number; note: string };
  totals: { activities: number; distanceKm: number; movingTimeHours: number; calories: number; elevationM: number; prs: number; kudos: number };
  byType: { type: string; count: number; distanceKm: number; timeHours: number; calories: number; elevationM: number; prs: number }[];
  byMonth: { month: string; count: number; distanceKm: number; calories: number }[];
  highlights: {
    longestActivity: { name: string; type: string; date: string; distanceKm: number };
    mostElevation: { name: string; type: string; date: string; elevationM: number };
    mostCalories: { name: string; type: string; date: string; calories: number };
  };
  recentActivities: RecentActivity[];
}

const sportIcon = (type: string) =>
  type.includes('Ride') ? <Bike size={14} /> : <Footprints size={14} />;

export default function StravaWidget() {
  const [data, setData] = useState<StravaOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API}/artifacts/strava-overview/outputs/latest`)
      .then(r => r.json())
      .then(json => setData(json.data))
      .catch(() => setError(true));
  }, []);

  if (error) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-zinc-500 text-sm">
      Sin datos de Strava todavía. Pídele a Claude que corra el artefacto &quot;Strava Overview&quot;.
    </div>
  );

  if (!data) return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse h-48" />
  );

  const monthChart = data.byMonth.map(m => ({
    name: new Date(`${m.month}-01`).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    km: m.distanceKm,
  }));

  const stats = [
    { label: 'Actividades', value: String(data.totals.activities), icon: <Trophy size={16} className="text-orange-400" /> },
    { label: 'Distancia', value: `${data.totals.distanceKm.toLocaleString()} km`, icon: <TrendingUp size={16} className="text-orange-400" /> },
    { label: 'Tiempo', value: `${data.totals.movingTimeHours} h`, icon: <Bike size={16} className="text-orange-400" /> },
    { label: 'Calorías', value: data.totals.calories.toLocaleString(), icon: <Flame size={16} className="text-orange-400" /> },
    { label: 'Desnivel', value: `${data.totals.elevationM.toLocaleString()} m`, icon: <Mountain size={16} className="text-orange-400" /> },
    { label: 'PRs', value: String(data.totals.prs), icon: <Trophy size={16} className="text-yellow-400" /> },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-semibold text-white flex items-center gap-2">
            <span className="text-orange-500">⚡</span> Strava — Overview completo
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {data.athlete.name} · {data.athlete.location} · {data.period.note}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {data.byType.slice(0, 4).map(t => (
            <span key={t.type} className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
              {sportIcon(t.type)} {t.count}x {t.type}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">{s.icon}{s.label}</div>
            <div className="text-white font-semibold text-lg">{s.value}</div>
          </div>
        ))}
      </div>

      {monthChart.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">Distancia por mes (km)</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthChart} barGap={4}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Bar dataKey="km" name="Km" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="bg-zinc-800/40 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">🏆 Más larga</p>
          <p className="text-sm text-white font-medium truncate">{data.highlights.longestActivity.name}</p>
          <p className="text-xs text-zinc-400">{data.highlights.longestActivity.distanceKm} km · {data.highlights.longestActivity.type}</p>
        </div>
        <div className="bg-zinc-800/40 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">⛰️ Más desnivel</p>
          <p className="text-sm text-white font-medium truncate">{data.highlights.mostElevation.name}</p>
          <p className="text-xs text-zinc-400">{data.highlights.mostElevation.elevationM} m · {data.highlights.mostElevation.type}</p>
        </div>
        <div className="bg-zinc-800/40 rounded-lg p-3">
          <p className="text-xs text-zinc-500 mb-1">🔥 Más calorías</p>
          <p className="text-sm text-white font-medium truncate">{data.highlights.mostCalories.name}</p>
          <p className="text-xs text-zinc-400">{data.highlights.mostCalories.calories} kcal · {data.highlights.mostCalories.type}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-zinc-500 mb-2">Actividad reciente</p>
        <div className="space-y-2">
          {data.recentActivities.slice(0, 8).map(a => (
            <div key={a.id} className="flex items-center gap-3 text-sm bg-zinc-800/30 rounded-lg px-3 py-2">
              <span className="text-zinc-400">{sportIcon(a.type)}</span>
              <span className="flex-1 text-zinc-300 truncate">{a.name}</span>
              <span className="text-zinc-500 text-xs">{new Date(a.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              <span className="text-zinc-400 text-xs">{a.distanceKm} km</span>
              {a.prs > 0 && (
                <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded-full">
                  {a.prs} PRs
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
