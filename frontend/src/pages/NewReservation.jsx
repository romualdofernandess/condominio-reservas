import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

export default function NewReservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState(null);
  const [occupied, setOccupied] = useState([]);
  const [form, setForm] = useState({ date: '', startTime: '', endTime: '', guests: 1, notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/spaces/${id}`).then(r => setSpace(r.data));
  }, [id]);

  useEffect(() => {
    if (!form.date) return;
    api.get(`/reservations/space/${id}?date=${form.date}`).then(r => setOccupied(r.data));
  }, [form.date, id]);

  function isOccupied(hour) {
    return occupied.some(r => r.startTime <= hour && hour < r.endTime);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (form.startTime >= form.endTime) return setError('Horário de fim deve ser maior que o de início');
    setError('');
    setLoading(true);
    try {
      await api.post('/reservations', { ...form, spaceId: id });
      navigate('/minhas-reservas');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  }

  if (!space) return <div className="text-center py-20 text-gray-400">Carregando...</div>;

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Reservar: {space.name}</h1>
      <p className="text-gray-500 text-sm mb-6">👥 Capacidade: {space.capacity} | {space.rules}</p>

      {error && <p className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <input
            type="date" required min={today}
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {form.date && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Horários ocupados</label>
            <div className="flex flex-wrap gap-2">
              {HOURS.map(h => (
                <span key={h} className={`text-xs px-2 py-1 rounded ${isOccupied(h) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{h}</span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
            <select required value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">--</option>
              {HOURS.map(h => <option key={h} value={h} disabled={isOccupied(h)}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
            <select required value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">--</option>
              {HOURS.map(h => <option key={h} value={h} disabled={isOccupied(h)}>{h}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de convidados</label>
          <input type="number" min={1} max={space.capacity} required
            value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
          <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-60">
          {loading ? 'Reservando...' : 'Confirmar Reserva'}
        </button>
      </form>
    </div>
  );
}
