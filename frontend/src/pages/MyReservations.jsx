import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const STATUS_LABEL = { PENDING: 'Pendente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada' };
const STATUS_COLOR = { PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-600' };

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await api.get('/reservations');
    setReservations(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!confirm('Cancelar esta reserva?')) return;
    await api.patch(`/reservations/${id}/status`, { status: 'CANCELLED' });
    load();
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Minhas Reservas</h1>
      {reservations.length === 0 ? (
        <p className="text-gray-500 text-center py-16">Você ainda não tem reservas.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow border border-gray-100 p-4 flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-800">{r.space.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  📅 {format(new Date(r.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} &nbsp;
                  🕐 {r.startTime} – {r.endTime}
                </p>
                <p className="text-sm text-gray-500">👥 {r.guests} convidados</p>
                {r.notes && <p className="text-sm text-gray-400 mt-1">📝 {r.notes}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
                {r.status !== 'CANCELLED' && (
                  <button onClick={() => cancel(r.id)} className="text-xs text-red-500 hover:underline">
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
