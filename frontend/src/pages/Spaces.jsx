import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Spaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/spaces').then(r => setSpaces(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando espaços...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Espaços Disponíveis</h1>
      <p className="text-gray-500 mb-8">Escolha um espaço para fazer sua reserva</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map(space => (
          <div key={space.id} className="bg-white rounded-xl shadow hover:shadow-md transition border border-gray-100 overflow-hidden">
            <div className="bg-blue-100 h-36 flex items-center justify-center text-5xl">
              {space.name.includes('Festa') ? '🎉' : space.name.includes('Churras') ? '🔥' : space.name.includes('Quadra') ? '🏀' : '🍽️'}
            </div>
            <div className="p-4">
              <h2 className="font-semibold text-gray-800 text-lg">{space.name}</h2>
              <p className="text-gray-500 text-sm mt-1 mb-3">{space.description}</p>
              <p className="text-xs text-gray-400 mb-4">👥 Capacidade: {space.capacity} pessoas</p>
              <Link
                to={`/espacos/${space.id}/reservar`}
                className="block text-center bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
              >
                Reservar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
