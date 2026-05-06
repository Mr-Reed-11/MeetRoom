import { useState, type FormEvent } from 'react';
import { Loader2, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPw, setIsLoadingPw] = useState(false);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsLoadingProfile(true);
    try {
      await api.patch(`/users/${user?.id}`, { name, email });
      setProfileSuccess('Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setProfileError(apiErr.message ?? 'Erro ao atualizar perfil');
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword !== confirmPassword) { setPwError('As senhas não coincidem.'); return; }
    if (newPassword.length < 6) { setPwError('A senha deve ter pelo menos 6 caracteres.'); return; }
    setIsLoadingPw(true);
    try {
      await api.patch(`/users/${user?.id}`, { password: newPassword });
      setPwSuccess('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setPwError(apiErr.message ?? 'Erro ao alterar senha');
    } finally {
      setIsLoadingPw(false);
    }
  }

  const inputClass = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <div className="max-w-xl flex flex-col gap-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5 pb-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Informações do Perfil</h2>
        </div>

        {profileSuccess && (
          <div className="mb-4 px-3.5 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">{profileSuccess}</div>
        )}
        {profileError && (
          <div className="mb-4 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{profileError}</div>
        )}

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Perfil</label>
            <input type="text" value={user?.role === 'admin' ? 'Administrador' : 'Usuário'} disabled className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`} />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoadingProfile}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isLoadingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2.5 mb-5 pb-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
            <Lock className="w-4 h-4 text-orange-600" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Alterar Senha</h2>
        </div>

        {pwSuccess && (
          <div className="mb-4 px-3.5 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">{pwSuccess}</div>
        )}
        {pwError && (
          <div className="mb-4 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{pwError}</div>
        )}

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Senha Atual</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className={labelClass}>Nova Senha</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <label className={labelClass}>Confirmar Nova Senha</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} placeholder="••••••••" />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoadingPw}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isLoadingPw && <Loader2 className="w-4 h-4 animate-spin" />}
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
