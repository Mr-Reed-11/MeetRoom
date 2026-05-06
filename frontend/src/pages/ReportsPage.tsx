import { useState, useEffect } from 'react';
import { BarChart2, Loader2, TrendingUp, XCircle, DoorOpen } from 'lucide-react';
import { api } from '../services/api';
import type { Booking, Room } from '../types';

interface UsageStat {
  room_id: string;
  room_name: string;
  total_bookings: number;
  total_hours: number;
  usage_rate: number;
}

interface ReportData {
  bookings: Booking[];
  rooms: Room[];
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bookings, rooms] = await Promise.all([
          api.get<Booking[]>('/reports/bookings'),
          api.get<Room[]>('/rooms'),
        ]);
        setData({ bookings, rooms });
      } catch {
        const [bookings, rooms] = await Promise.all([
          api.get<Booking[]>('/bookings').catch(() => [] as Booking[]),
          api.get<Room[]>('/rooms').catch(() => [] as Room[]),
        ]);
        setData({ bookings, rooms });
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { bookings, rooms } = data;
  const active = bookings.filter((b) => b.status === 'active');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  const usageStats: UsageStat[] = rooms.map((room) => {
    const roomBookings = active.filter((b) => b.room_id === room.id);
    const totalHours = roomBookings.reduce((acc, b) => {
      return acc + (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 3600000;
    }, 0);
    return {
      room_id: room.id,
      room_name: room.name,
      total_bookings: roomBookings.length,
      total_hours: Math.round(totalHours * 10) / 10,
      usage_rate: active.length > 0 ? Math.round((roomBookings.length / active.length) * 100) : 0,
    };
  }).sort((a, b) => b.total_bookings - a.total_bookings);

  const maxBookings = usageStats[0]?.total_bookings ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total de Reservas" value={bookings.length} icon={BarChart2} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard label="Reservas Ativas" value={active.length} icon={TrendingUp} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="Canceladas" value={cancelled.length} icon={XCircle} iconBg="bg-red-50" iconColor="text-red-500" />
        <StatCard label="Salas Cadastradas" value={rooms.length} icon={DoorOpen} iconBg="bg-purple-50" iconColor="text-purple-600" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Utilização por Sala</h2>
        {usageStats.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sem dados disponíveis.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {usageStats.map((stat) => (
              <div key={stat.room_id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stat.room_name}</span>
                  <span className="text-xs text-gray-400">{stat.total_bookings} reserva(s) · {stat.total_hours}h</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${maxBookings > 0 ? (stat.total_bookings / maxBookings) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Reservas Recentes</h2>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Sem reservas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Sala</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Data</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.slice(0, 10).map((b) => {
                const room = rooms.find((r) => r.id === b.room_id);
                return (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{b.title}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{room?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-gray-400 hidden lg:table-cell">
                      {new Date(b.start_time).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${b.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {b.status === 'active' ? 'Ativa' : 'Cancelada'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
