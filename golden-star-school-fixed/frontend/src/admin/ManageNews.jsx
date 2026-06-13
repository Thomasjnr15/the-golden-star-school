import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import axios from 'axios';

function ManageNews() {
  const [news, setNews] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: '', image_url: '' });
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('gss_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => axios.get('/api/news', { headers }).then(r => setNews(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const openAdd = () => { setEditing(null); setForm({ title: '', description: '', date: new Date().toISOString().slice(0,10), image_url: '' }); setModal(true); };
  const openEdit = (n) => { setEditing(n); setForm({ title: n.title, description: n.description, date: n.date?.slice(0,10), image_url: n.image_url || '' }); setModal(true); };

  const save = async () => {
    try {
      if (editing) await axios.put(`/api/news/${editing.id}`, form, { headers });
      else await axios.post('/api/news', form, { headers });
      setModal(false); load(); flash(editing ? 'News updated!' : 'News posted!');
    } catch (e) { flash(e.response?.data?.message || 'Error'); }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this news post?')) return;
    await axios.delete(`/api/news/${id}`, { headers }); load();
  };

  return (
    <AdminLayout title="Manage News & Announcements">
      {msg && <div className={`mb-4 p-4 rounded-xl text-sm font-semibold ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{msg}</div>}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-blue-900">All News Posts ({news.length})</h3>
          <button onClick={openAdd} className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors text-sm">+ Post News</button>
        </div>

        {news.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-5xl mb-3">📢</div>
            <p>No news posts yet. Create one!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {news.map(n => (
              <div key={n.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{n.title}</p>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{n.description}</p>
                    <p className="text-xs text-gray-400 mt-2">📅 {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    <button onClick={() => openEdit(n)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">✏️ Edit</button>
                    <button onClick={() => remove(n.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-blue-900 mb-5">{editing ? 'Edit News' : 'Post New Announcement'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                <input type="text" placeholder="News title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea rows={4} placeholder="Write the full announcement here..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL (optional)</label>
                <input type="text" placeholder="https://..." value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={save} className="flex-1 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 text-sm">
                {editing ? 'Update News' : 'Post News'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ManageNews;
