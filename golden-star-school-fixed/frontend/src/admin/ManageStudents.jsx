import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import axios from 'axios';

const CLASSES = ['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3'];

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: '', registration_number: '', class: 'Primary 1', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('gss_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => axios.get('/api/students', { headers }).then(r => setStudents(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ full_name: '', registration_number: '', class: 'Primary 1', password: '' }); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ full_name: s.full_name, registration_number: s.registration_number, class: s.class, password: '' }); setModal(true); };

  const save = async () => {
    setLoading(true);
    try {
      if (editing) {
        await axios.put(`/api/students/${editing.id}`, form, { headers });
        setMsg('Student updated!');
      } else {
        await axios.post('/api/students', form, { headers });
        setMsg('Student added!');
      }
      setModal(false);
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error saving student');
    }
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await axios.delete(`/api/students/${id}`, { headers });
    load();
  };

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.registration_number.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Manage Students">
      {msg && <div className={`mb-4 p-4 rounded-xl text-sm font-semibold ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{msg}</div>}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <input type="text" placeholder="🔍 Search by name, reg. number, class..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <button onClick={openAdd}
            className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors text-sm flex-shrink-0">
            + Add Student
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Reg. Number</th>
                <th className="py-3 px-6 text-left">Class</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-gray-400">No students found</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-800">{s.full_name}</td>
                  <td className="py-4 px-6 text-gray-600 font-mono">{s.registration_number}</td>
                  <td className="py-4 px-6">
                    <span className="bg-blue-50 text-blue-700 font-semibold text-xs px-3 py-1 rounded-full">{s.class}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 font-semibold mr-4 text-xs">✏️ Edit</button>
                    <button onClick={() => remove(s.id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
          {filtered.length} student{filtered.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-blue-900 mb-5">{editing ? 'Edit Student' : 'Add New Student'}</h3>
            <div className="space-y-4">
              {[['Full Name', 'full_name', 'text', 'e.g. John Doe'],
                ['Registration Number', 'registration_number', 'text', 'e.g. GSS/2026/001'],
                ['Password', 'password', 'password', editing ? 'Leave blank to keep current' : 'Set password']
              ].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                <select value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button onClick={save} disabled={loading} className="flex-1 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors text-sm disabled:opacity-60">
                {loading ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ManageStudents;
