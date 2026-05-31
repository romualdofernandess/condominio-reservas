import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow relative">
      <Link to="/" className="text-xl font-bold">🏢 Condomínio</Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/espacos" className="hover:underline text-sm">Espaços</Link>
            <Link to="/minhas-reservas" className="hover:underline text-sm">Minhas Reservas</Link>

            {user.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setAdminOpen(o => !o)}
                  onBlur={() => setTimeout(() => setAdminOpen(false), 150)}
                  className={`flex items-center gap-1 text-sm hover:underline ${isAdmin ? 'font-semibold' : ''}`}
                >
                  Admin ▾
                </button>
                {adminOpen && (
                  <div className="absolute right-0 top-8 bg-white text-gray-800 rounded-lg shadow-lg py-1 w-44 z-50">
                    <Link to="/admin" onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50">📋 Reservas</Link>
                    <Link to="/admin/moradores" onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50">👥 Moradores</Link>
                    <Link to="/admin/espacos" onClick={() => setAdminOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50">🏢 Espaços</Link>
                  </div>
                )}
              </div>
            )}

            <span className="text-sm opacity-80">Olá, {user.name.split(' ')[0]}</span>
            <button onClick={handleLogout} className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50">
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline text-sm">Entrar</Link>
            <Link to="/cadastro" className="bg-white text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50">
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
