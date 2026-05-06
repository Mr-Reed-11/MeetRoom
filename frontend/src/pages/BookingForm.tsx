import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import type { Booking, Room } from '../types';
import { api } from '../services/api';

interface BookingFormProps {
  rooms: Room[];
  initialDate?: Date;
  booking?: Booking;
  onSuccess: () => void;
  onCancel: () => void;
}

function toLocalDateTimeString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function BookingForm({ rooms, initialDate, booking, onSuccess, onCancel }: BookingFormProps) {
  const defaultStart = initialDate ? new Date(initialDate) : new Date();
  defaultStart.setHours(9, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(10, 0, 0, 0);

  const [title, setTitle] = useState(booking?.title ?? '');
  const [roomId, setRoomId] = useState(booking?.room_id ?? '');
  const [startTime, setStartTime] = useState(
    booking ? toLocalDateTimeString(new Date(booking.start_time)) : toLocalDateTimeString(defaultStart)
  );
  const [endTime, setEndTime] = useState(
    booking ? toLocalDateTimeString(new Date(booking.end_time)) : toLocalDateTimeString(defaultEnd)
  );
  const [notes, setNotes] = useState(booking?.notes ?? '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (new Date(startTime) >= new Date(endTime)) {
      setError('O horário de término deve ser após o início.');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        title,
        room_id: roomId,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        notes,
      };
      if (booking) {
        await api.patch(`/bookings/${booking.id}`, payload);
      } else {
        await api.post('/bookings', payload);
      }
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? 'Erro ao salvar reserva');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Título da reunião</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Ex: Reunião de planejamento" />
      </div>

      <div>
        <label className={labelClass}>Sala</label>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required className={inputClass}>
          <option value="">Selecione uma sala...</option>
          {rooms.filter((r) => r.is_active).map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.capacity} pessoas) — {r.location}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Início</label>
          <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Término</label>
          <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Observações <span className="text-gray-400 font-normal">(opcional)</span></label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} placeholder="Pauta, participantes..." />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {booking ? 'Salvar' : 'Criar Reserva'}
        </button>
      </div>
    </form>
  );
}
