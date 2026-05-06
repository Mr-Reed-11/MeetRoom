import { useState, useEffect } from 'react';
import { Plus, Clock, DoorOpen, Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Booking, Room } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/ui/Modal';
import { BookingForm } from './BookingForm';
import { Badge } from '../components/ui/Badge';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      const [b, r] = await Promise.all([
        api.get<Booking[]>('/bookings'),
        api.get<Room[]>('/rooms'),
      ]);
      setBookings(b);
      setRooms(r);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Cancelar esta reserva?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/bookings/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(booking: Booking) { setEditing(booking); setShowModal(true); }
  function handleClose() { setShowModal(false); setEditing(null); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{bookings.length} reserva(s)</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Nova Reserva
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DoorOpen className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Você não tem reservas</p>
          <p className="text-gray-400 text-xs mt-1">Crie sua primeira reserva clicando acima</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Sala</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Período</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((booking) => {
                  const room = rooms.find((r) => r.id === booking.room_id);
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{booking.title}</td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                        <span className="flex items-center gap-1.5">
                          <DoorOpen className="w-3.5 h-3.5 text-gray-400" />
                          {room?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDateTime(booking.start_time)} – {new Date(booking.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={booking.status === 'active' ? 'green' : 'red'}>
                          {booking.status === 'active' ? 'Ativa' : 'Cancelada'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {booking.status === 'active' && (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => handleEdit(booking)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(booking.id)}
                              disabled={deletingId === booking.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                              {deletingId === booking.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleClose} title={editing ? 'Editar Reserva' : 'Nova Reserva'}>
        <BookingForm
          rooms={rooms}
          booking={editing ?? undefined}
          onSuccess={() => { handleClose(); load(); }}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
