import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import axios from 'axios';

const CLASSES = ['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3'];

function RegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // viewing full details
  const [approveModal, setApproveModal] = useState(false);
  const [approveForm, setApproveForm] = useState({ registration_number: '', class: '', password: '' });
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('pending');
  const token = localStorage.getItem('gss_token');
  const headers = { Authorization: `Bearer ${token}` };

  const load = () => {
    setLoading(true);
    axios.get('/api/registrations', { headers })
      .then(r => setRequests(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };

  const openApprove = (req) => {
    setSelected(req);
    setApproveForm({
      registration_number: `GSS/2026/${String(Math.floor(Math.random() * 900) + 100)}`,
      class: req.class_applying,
      password: 'School@1234',
    });
    setApproveModal(true);
  };

  const handleApprove = async () => {
    if (!approveForm.registration_number || !approveForm.class || !approveForm.password) {
      flash('❌ Please fill in all fields');
      return;
    }
    try {
      await axios.post(`/api/registrations/${selected.id}/approve`, approveForm, { headers });
      setApproveModal(false);
      setSelected(null);
      load();
      flash('✅ Student approved and account created!');
    } catch (e) {
      flash(e.response?.data?.message || '❌ Error approving student');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this registration?')) return;
    try {
      await axios.post(`/api/registrations/${id}/reject`, {}, { headers });
      load();
      flash('Registration rejected.');
    } catch {
      flash('❌ Error rejecting registration');
    }
  };

  const filtered = requests.filter(r => filter === 'all' ? true : r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout title="Registration Requests">
      {msg && (
        <div className={`mb-4 p-4 rounded-xl text-sm font-semibold ${msg.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'from-yellow-400 to-yellow-600', icon: '⏳' },
          { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, color: 'from-green-500 to-green-700', icon: '✅' },
          { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, color: 'from-red-500 to-red-700', icon: '❌' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-5 shadow-md`}>
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-white text-opacity-80 text-sm">{card.label}</div>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <p className="text-yellow-800 font-semibold text-sm">
            You have <span className="text-yellow-900 font-bold">{pendingCount} pending</span> registration request{pendingCount > 1 ? 's' : ''} waiting for your review!
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Filter Tabs */}
        <div className="p-4 border-b border-gray-100 flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors
                ${filter === f ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f} {f === 'pending' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p>No {filter === 'all' ? '' : filter} registration requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(req => (
              <div key={req.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-yellow-400 font-bold text-lg flex-shrink-0">
                      {req.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{req.full_name}</p>
                      <p className="text-gray-500 text-sm mt-0.5">
                        Class: <span className="font-semibold text-blue-900">{req.class_applying}</span>
                        {' · '}Gender: {req.gender}
                        {' · '}DOB: {req.date_of_birth ? new Date(req.date_of_birth).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Parent: {req.parent_name} · 📞 {req.parent_phone}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Submitted: {new Date(req.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full
                      ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'}`}>
                      {req.status === 'pending' ? '⏳ Pending' :
                       req.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>

                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => openApprove(req)}
                          className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm">
                          ✅ Approve
                        </button>
                        <button onClick={() => handleReject(req.id)}
                          className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors text-sm">
                          ❌ Reject
                        </button>
                      </div>
                    )}

                    {/* View Details */}
                    <button onClick={() => setSelected(selected?.id === req.id ? null : req)}
                      className="px-4 py-2 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                      {selected?.id === req.id ? 'Hide' : '👁 View'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selected?.id === req.id && !approveModal && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                      ['Full Name', req.full_name],
                      ['Date of Birth', req.date_of_birth ? new Date(req.date_of_birth).toLocaleDateString() : 'N/A'],
                      ['Gender', req.gender],
                      ['Class Applying For', req.class_applying],
                      ['Previous School', req.previous_school || 'Not provided'],
                      ['Parent Name', req.parent_name],
                      ['Parent Phone', req.parent_phone],
                      ['Parent Email', req.parent_email || 'Not provided'],
                      ['Home Address', req.home_address],
                      ['Additional Info', req.additional_info || 'None'],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-white rounded-lg p-3">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-gray-800 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveModal && selected && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Approve Registration</h3>
            <p className="text-gray-500 text-sm mb-5">
              You are approving <span className="font-bold text-blue-900">{selected.full_name}</span>.
              Set their login details below:
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="e.g. GSS/2026/010"
                  value={approveForm.registration_number}
                  onChange={e => setApproveForm({ ...approveForm, registration_number: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <p className="text-gray-400 text-xs mt-1">This is the student's username for login</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Assign Class <span className="text-red-500">*</span>
                </label>
                <select value={approveForm.class}
                  onChange={e => setApproveForm({ ...approveForm, class: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="e.g. School@1234"
                  value={approveForm.password}
                  onChange={e => setApproveForm({ ...approveForm, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                <p className="text-gray-400 text-xs mt-1">Share this with the student/parent</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-4">
              <p className="text-green-700 text-xs font-semibold">
                ✅ After approval, the student will be added to the Students list and can login immediately with these details.
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setApproveModal(false); setSelected(null); }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">
                Cancel
              </button>
              <button onClick={handleApprove}
                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm">
                ✅ Approve & Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default RegistrationRequests;
