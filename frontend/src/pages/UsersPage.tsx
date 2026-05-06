import { useState, useEffect, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Loader2, Users } from 'lucide-react';
import type { User, Role } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(user?.role ?? 'user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (user) {
        const payload: Partial<{ name: string; email: string; role: Role; password: string }> = { name, email, role };
        if (password) payload.password = password;
        await api.patch(`/users/${user.id}`, payload);
      } else {
        await api.post('/users', { name, email, password, role });
      }
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? 'Erro ao salvar usuário');
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
        <label className={labelClass}>Nome</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{user ? 'Nova Senha' : 'Senha'} {user && <span className="text-gray-400 font-normal">(opcional)</span>}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!user} className={inputClass} placeholder="••••••••" />
      </div>
      <div>
        <label className={labelClass}>Perfil</label>
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
        <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {user ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    try {
      setUsers(await api.get<User[]>('/users'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Remover este usuário?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  function handleClose() { setShowModal(false); setEditing(null); }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{users.length} usuário(s)</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">E-mail</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={u.role === 'admin' ? 'blue' : 'slate'}>
                      {u.role === 'admin' ? 'Admin' : 'Usuário'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditing(u); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} disabled={deletingId === u.id} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50">
                        {deletingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleClose} title={editing ? 'Editar Usuário' : 'Novo Usuário'}>
        <UserForm
          user={editing ?? undefined}
          onSuccess={() => { handleClose(); load(); }}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
