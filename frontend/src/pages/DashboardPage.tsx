import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, DoorOpen } from 'lucide-react';
import type { Booking, Room } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/ui/Modal';
import { BookingForm } from './BookingForm';
import { Badge } from '../components/ui/Badge';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get<Booking[]>('/bookings').then(setBookings).catch(() => setBookings([]));
    api.get<Room[]>('/rooms').then(setRooms).catch(() => setRooms([]));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const dayBookings = bookings.filter((b) =>
    isSameDay(new Date(b.start_time), selectedDate)
  );

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)); }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)); }
  function handleDayClick(day: number) { setSelectedDate(new Date(year, month, day)); }
  function refreshBookings() { api.get<Booking[]>('/bookings').then(setBookings).catch(() => {}); }

  const today = new Date();

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 w-full lg:w-72 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {MONTHS[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <span key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const cellDate = new Date(year, month, day);
            const isToday = isSameDay(cellDate, today);
            const isSelected = isSameDay(cellDate, selectedDate);
            const hasBooking = bookings.some((b) => isSameDay(new Date(b.start_time), cellDate));

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative h-9 w-full flex items-center justify-center rounded-lg text-sm transition-all
                  ${isSelected ? 'bg-blue-600 text-white font-semibold shadow-sm' : ''}
                  ${isToday && !isSelected ? 'font-semibold text-blue-600 ring-1 ring-blue-200' : ''}
                  ${!isSelected && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}
                `}
              >
                {day}
                {hasBooking && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 capitalize">
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {dayBookings.length} {dayBookings.length === 1 ? 'reserva' : 'reservas'}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Nova Reserva
          </button>
        </div>

        {dayBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DoorOpen className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Nenhuma reserva neste dia</p>
            <p className="text-gray-400 text-xs mt-1">Clique em "Nova Reserva" para agendar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dayBookings
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .map((booking) => {
                const room = rooms.find((r) => r.id === booking.room_id);
                return (
                  <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="w-1 self-stretch rounded-full bg-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{booking.title}</p>
                        <Badge variant={booking.status === 'active' ? 'green' : 'red'}>
                          {booking.status === 'active' ? 'Ativa' : 'Cancelada'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
                        </span>
                        {room && (
                          <span className="flex items-center gap-1.5">
                            <DoorOpen className="w-3.5 h-3.5" />
                            {room.name}
                          </span>
                        )}
                      </div>
                      {booking.notes && (
                        <p className="text-xs text-gray-400 mt-1.5 italic">{booking.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nova Reserva">
        <BookingForm
          rooms={rooms}
          initialDate={selectedDate}
          onSuccess={() => { setShowModal(false); refreshBookings(); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
