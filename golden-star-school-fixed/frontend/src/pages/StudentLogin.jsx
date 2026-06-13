import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function StudentLogin() {
  const [form, setForm] = useState({ registration_number: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/student-login', form);
      login(res.data.student, 'student', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid registration number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #001F54 0%, #003080 100%)' }}>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-2xl mx-auto mb-4">G</div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>Golden Star School</h1>
          <p className="text-blue-300 mt-1">Student Portal</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-blue-900 mb-6 text-center">Student Login</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
              <input type="text" placeholder="e.g. GSS/2026/001"
                value={form.registration_number}
                onChange={e => setForm({ ...form, registration_number: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input type="password" placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm" />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-all duration-300 disabled:opacity-60 mt-2">
              {loading ? 'Logging in...' : 'Login to Dashboard →'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">Forgot your password? <a href="#contact" className="text-yellow-600 font-semibold hover:underline">Contact Admin</a></p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-blue-300 hover:text-white transition-colors text-sm">← Back to Website</Link>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
