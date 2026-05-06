import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Users, MapPin, Pencil, Trash2, Loader2, DoorOpen } from 'lucide-react';
import type { Room } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';

interface RoomFormProps {
  room?: Room;
  onSuccess: () => void;
  onCancel: () => void;
}

function RoomForm({ room, onSuccess, onCancel }: RoomFormProps) {
  const [name, setName] = useState(room?.name ?? '');
  const [capacity, setCapacity] = useState(String(room?.capacity ?? ''));
  const [location, setLocation] = useState(room?.location ?? '');
  const [description, setDescription] = useState(room?.description ?? '');
  const [isActive, setIsActive] = useState(room?.is_active ?? true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload = { name, capacity: Number(capacity), location, description, is_active: isActive };
      if (room) {
        await api.patch(`/rooms/${room.id}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? 'Erro ao salvar sala');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
      )}
      <div>
        <label className={labelClass}>Nome da Sala</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} placeholder="Ex: Sala Alpha" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Capacidade</label>
          <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required className={inputClass} placeholder="10" />
        </div>
        <div>
          <label className={labelClass}>Localização</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className={inputClass} placeholder="Bloco A, 2º andar" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Descrição <span className="text-gray-400 font-normal">(opcional)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} placeholder="Recursos disponíveis..." />
      </div>
      <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        Sala ativa
      </label>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {room ? 'Salvar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}

export function RoomsPage() {
  const { isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      setRooms(await api.get<Room[]>('/rooms'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Remover esta sala?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/rooms/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  function handleClose() { setShowModal(false); setEditing(null); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{rooms.length} sala(s)</p>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            Nova Sala
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DoorOpen className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Nenhuma sala cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{room.name}</h3>
                  <div className="mt-1.5">
                    <Badge variant={room.is_active ? 'green' : 'slate'}>
                      {room.is_active ? 'Disponível' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => { setEditing(room); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(room.id)} disabled={deletingId === room.id} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                      {deletingId === room.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {room.capacity} pessoa(s)
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {room.location}
                </span>
              </div>

              {room.description && (
                <p className="text-xs text-gray-400 border-t border-gray-50 pt-3 leading-relaxed">{room.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleClose} title={editing ? 'Editar Sala' : 'Nova Sala'}>
        <RoomForm
          room={editing ?? undefined}
          onSuccess={() => { handleClose(); load(); }}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
