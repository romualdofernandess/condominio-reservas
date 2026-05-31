import { useEffect, useState } from 'react';
import api from '../services/api';

const ROLE_LABEL = { ADMIN: 'Admin', RESIDENT: 'Morador' };
const ROLE_COLOR = { ADMIN: 'bg-purple-100 text-purple-700', RESIDENT: 'bg-blue-100 text-blue-700' };

function UserForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', email: '', password: '', apartment: '', block: '', role: 'RESIDENT' });
  const [error, setError] = useState('');
  const isEdit = !!initial;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        const { data } = await api.patch(`/users/${initial.id}`, form);
        onSave(data);
      } else {
        const { data } = await api.post('/users', form);
        onSave(data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  const f = (name, label, type = 'text', required = true) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} required={required && !isEdit} value={form[name]}
        onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
        placeholder={isEdit && name === 'password' ? 'Deixe em branco para não alterar' : ''}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        {f('name', 'Nome completo')}
        {f('email', 'E-mail', 'email')}
        {f('password', 'Senha', 'password', !isEdit)}
        {f('apartment', 'Apartamento')}
        {f('block', 'Bloco', 'text', false)}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
          <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="RESIDENT">Morador</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-800">
          {isEdit ? 'Salvar alterações' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    const { data } = await api.get('/users');
    setUsers(data);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Remover este usuário? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao remover');
    }
  }

  function handleSaved() {
    setShowForm(false);
    setEditing(null);
    load();
  }

  const groups = { ADMIN: users.filter(u => u.role === 'ADMIN'), RESIDENT: users.filter(u => u.role === 'RESIDENT') };
  const filtered = filter === 'ALL' ? users : users.filter(u => u.role === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Moradores</h1>
          <p className="text-sm text-gray-500 mt-1">
            {groups.ADMIN.length} admin{groups.ADMIN.length !== 1 ? 's' : ''} · {groups.RESIDENT.length} morador{groups.RESIDENT.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
          + Novo usuário
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">{editing ? 'Editar usuário' : 'Cadastrar novo usuário'}</h2>
          <UserForm initial={editing} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {[['ALL', 'Todos', users.length], ['ADMIN', 'Admins', groups.ADMIN.length], ['RESIDENT', 'Moradores', groups.RESIDENT.length]].map(([val, label, count]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${filter === val ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Lista agrupada */}
      {filter === 'ALL' ? (
        ['ADMIN', 'RESIDENT'].map(role => groups[role].length > 0 && (
          <div key={role} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{ROLE_LABEL[role]}s</h2>
            <UserList users={groups[role]} onEdit={u => { setEditing(u); setShowForm(false); }} onDelete={handleDelete} />
          </div>
        ))
      ) : (
        <UserList users={filtered} onEdit={u => { setEditing(u); setShowForm(false); }} onDelete={handleDelete} />
      )}
    </div>
  );
}

function UserList({ users, onEdit, onDelete }) {
  if (users.length === 0) return <p className="text-gray-400 text-center py-8">Nenhum usuário encontrado.</p>;
  return (
    <div className="space-y-2">
      {users.map(u => (
        <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{u.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[u.role]}`}>{ROLE_LABEL[u.role]}</span>
            </div>
            <p className="text-sm text-gray-500">{u.email} · Apto {u.apartment}{u.block ? ` / Bloco ${u.block}` : ''}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onEdit(u)} className="text-sm text-blue-600 hover:underline">Editar</button>
            <button onClick={() => onDelete(u.id)} className="text-sm text-red-500 hover:underline">Remover</button>
          </div>
        </div>
      ))}
    </div>
  );
}
