import { useEffect, useState } from 'react';
import api from '../services/api';

const SPACE_ICONS = { 'Salão': '🎉', 'Churras': '🔥', 'Quadra': '🏀', 'Gourmet': '🍽️', 'Piscina': '🏊', 'Academia': '🏋️' };
function spaceIcon(name) {
  const key = Object.keys(SPACE_ICONS).find(k => name.includes(k));
  return key ? SPACE_ICONS[key] : '🏢';
}

function SpaceForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', description: '', capacity: '', rules: '', imageUrl: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (initial) {
        const { data } = await api.put(`/spaces/${initial.id}`, form);
        onSave(data);
      } else {
        const { data } = await api.post('/spaces', form);
        onSave(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar espaço');
    }
  }

  const f = (name, label, type = 'text', required = true) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} required={required} value={form[name]}
        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        {f('name', 'Nome do espaço')}
        {f('capacity', 'Capacidade (pessoas)', 'number')}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Regras de uso</label>
        <textarea rows={3} value={form.rules} onChange={e => setForm(p => ({ ...p, rules: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800">
          {initial ? 'Salvar alterações' : 'Cadastrar espaço'}
        </button>
      </div>
    </form>
  );
}

export default function AdminSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    const { data } = await api.get('/spaces');
    setSpaces(data);
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(space) {
    await api.put(`/spaces/${space.id}`, { ...space, active: !space.active });
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Desativar este espaço? Ele não aparecerá mais para reservas.')) return;
    await api.delete(`/spaces/${id}`);
    load();
  }

  function handleSaved() {
    setShowForm(false);
    setEditing(null);
    load();
  }

  const active = spaces.filter(s => s.active);
  const inactive = spaces.filter(s => !s.active);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Espaços</h1>
          <p className="text-sm text-gray-500 mt-1">{active.length} ativo{active.length !== 1 ? 's' : ''}{inactive.length > 0 ? ` · ${inactive.length} inativo${inactive.length !== 1 ? 's' : ''}` : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
          + Novo espaço
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">{editing ? 'Editar espaço' : 'Cadastrar novo espaço'}</h2>
          <SpaceForm initial={editing} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Ativos</h2>
          <div className="space-y-2">
            {active.map(s => <SpaceCard key={s.id} space={s} onEdit={() => setEditing(s)} onToggle={() => toggleActive(s)} />)}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Inativos</h2>
          <div className="space-y-2">
            {inactive.map(s => <SpaceCard key={s.id} space={s} onEdit={() => setEditing(s)} onToggle={() => toggleActive(s)} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function SpaceCard({ space, onEdit, onToggle }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm px-4 py-3 flex justify-between items-center ${space.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{spaceIcon(space.name)}</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{space.name}</span>
            {!space.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inativo</span>}
          </div>
          <p className="text-sm text-gray-500">👥 {space.capacity} pessoas{space.rules ? ` · ${space.rules.slice(0, 60)}${space.rules.length > 60 ? '…' : ''}` : ''}</p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <button onClick={onEdit} className="text-sm text-blue-600 hover:underline">Editar</button>
        <button onClick={onToggle} className={`text-sm hover:underline ${space.active ? 'text-red-500' : 'text-green-600'}`}>
          {space.active ? 'Desativar' : 'Reativar'}
        </button>
      </div>
    </div>
  );
}
