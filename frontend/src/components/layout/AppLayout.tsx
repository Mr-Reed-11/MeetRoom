import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const TITLES: Record<string, string> = {
  '/dashboard': 'Calendário',
  '/bookings': 'Minhas Reservas',
  '/rooms': 'Salas',
  '/users': 'Usuários',
  '/reports': 'Relatórios',
  '/settings': 'Configurações',
};

export function AppLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'MeetRoom';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
