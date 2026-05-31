import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';

const STATUS_LABEL = { PENDING: 'Pendente', CONFIRMED: 'Confirmada', CANCELLED: 'Cancelada' };
const STATUS_COLOR = { PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-600' };

export default function Admin() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('PENDING');

  async function load() {
    const r = await api.get('/reservations');
    setReservations(r.data);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await api.patch(`/reservations/${id}/status`, { status });
    load();
  }

  const filtered = reservations.filter(r => filter === 'ALL' || r.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel Administrativo</h1>

      <div className="flex gap-2 mb-6">
        {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${filter === s ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            {s === 'ALL' ? 'Todas' : STATUS_LABEL[s]}
            {s !== 'ALL' && ` (${reservations.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Nenhuma reserva encontrada.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-800">{r.space.name}</h2>
                  <p className="text-sm text-gray-600">
                    👤 {r.user.name} — Apto {r.user.apartment}{r.user.block ? ` / Bloco ${r.user.block}` : ''}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    📅 {format(new Date(r.date), "dd/MM/yyyy", { locale: ptBR })} &nbsp;
                    🕐 {r.startTime} – {r.endTime} &nbsp;
                    👥 {r.guests} convidados
                  </p>
                  {r.notes && <p className="text-sm text-gray-400 mt-1">📝 {r.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                  {r.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(r.id, 'CONFIRMED')}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                        Aprovar
                      </button>
                      <button onClick={() => updateStatus(r.id, 'CANCELLED')}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
