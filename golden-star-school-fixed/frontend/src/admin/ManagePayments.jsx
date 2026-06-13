import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import axios from 'axios';

function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ student_id: '', amount: '', date_paid: new Date().toISOString().slice(0,10), status: 'pending' });
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');
  const token = localStorage.getItem('gss_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    axios.get('/api/payments', { headers }).then(r => setPayments(r.data)).catch(() => {});
    axios.get('/api/students', { headers }).then(r => setStudents(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const openAdd = () => { setEditing(null); setForm({ student_id: '', amount: '', date_paid: new Date().toISOString().slice(0,10), status: 'pending' }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ student_id: p.student_id, amount: p.amount, date_paid: p.date_paid?.slice(0,10), status: p.status }); setModal(true); };

  const save = async () => {
    try {
      if (editing) await axios.put(`/api/payments/${editing.id}`, form, { headers });
      else await axios.post('/api/payments', form, { headers });
      setModal(false); load(); flash(editing ? 'Payment updated!' : 'Payment recorded!');
    } catch (e) { flash(e.response?.data?.message || 'Error'); }
  };

  const toggleStatus = async (p) => {
    const newStatus = p.status === 'paid' ? 'pending' : 'paid';
    await axios.put(`/api/payments/${p.id}`, { ...p, status: newStatus }, { headers });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this payment record?')) return;
    await axios.delete(`/api/payments/${id}`, { headers }); load();
  };

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <AdminLayout title="Manage Payments">
      {msg && <div className={`mb-4 p-4 rounded-xl text-sm font-semibold ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{msg}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Paid', value: `₦${totalPaid.toLocaleString()}`, color: 'from-green-500 to-green-700', icon: '✅' },
          { label: 'Total Pending', value: `₦${totalPending.toLocaleString()}`, color: 'from-red-500 to-red-700', icon: '⏳' },
          { label: 'Total Records', value: payments.length, color: 'from-blue-500 to-blue-700', icon: '📋' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-5 shadow-md`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-xl font-bold">{card.value}</div>
            <div className="text-white text-opacity-80 text-sm">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            {['all', 'paid', 'pending'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors capitalize
                  ${filter === f ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={openAdd} className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors text-sm flex-shrink-0">
            + Record Payment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                <th className="py-3 px-6 text-left">Student</th>
                <th className="py-3 px-6 text-left">Class</th>
                <th className="py-3 px-6 text-left">Amount</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No payment records found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-800">{p.student_name}</td>
                  <td className="py-4 px-6 text-gray-500 text-xs">{p.student_class}</td>
                  <td className="py-4 px-6 font-bold text-blue-900">₦{Number(p.amount).toLocaleString()}</td>
                  <td className="py-4 px-6 text-gray-500">{new Date(p.date_paid).toLocaleDateString()}</td>
                  <td className="py-4 px-6">
                    <button onClick={() => toggleStatus(p)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors
                        ${p.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                      {p.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 font-semibold mr-3 text-xs">✏️ Edit</button>
                    <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-700 font-semibold text-xs">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-blue-900 mb-5">{editing ? 'Edit Payment' : 'Record Payment'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student</label>
                <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.class})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (₦)</label>
                <input type="number" placeholder="e.g. 25000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Paid</label>
                <input type="date" value={form.date_paid} onChange={e => setForm({ ...form, date_paid: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  <option value="pending">⏳ Pending</option>
                  <option value="paid">✅ Paid</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 text-sm">
                {editing ? 'Update' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ManagePayments;
