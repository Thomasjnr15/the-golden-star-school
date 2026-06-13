import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
    { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/admin/exams', label: 'Exams & CBT', icon: '📝' },
    { path: '/admin/news', label: 'News', icon: '📢' },
    { path: '/admin/payments', label: 'Payments', icon: '💰' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Poppins, sans-serif', background: '#F1F5F9' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
        <div className="p-6 border-b border-white border-opacity-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold">G</div>
            <div>
              <p className="font-bold text-sm">Golden Star School</p>
              <p className="text-blue-300 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                ${location.pathname === item.path
                  ? 'bg-yellow-400 text-blue-900'
                  : 'text-blue-200 hover:bg-white hover:bg-opacity-10 hover:text-white'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white border-opacity-10">
          <button onClick={() => { logout(); navigate('/admin/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-300 hover:bg-white hover:bg-opacity-10 hover:text-white transition-all text-sm">
            🚪 Logout
          </button>
          <Link to="/" target="_blank"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-300 hover:bg-white hover:bg-opacity-10 hover:text-white transition-all text-sm mt-1">
            🌐 View Website
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 text-xl">☰</button>
            <h1 className="text-lg font-bold text-blue-900">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm">
              {user?.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <span className="text-gray-600 text-sm hidden sm:block">{user?.email}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, exams: 0, news: 0, messages: 0, payments: { paid: 0, pending: 0 } });
  const token = localStorage.getItem('gss_token');

  useEffect(() => {
    axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: '👨‍🎓', color: 'from-blue-500 to-blue-700', link: '/admin/students' },
    { label: 'Total Exams', value: stats.exams, icon: '📝', color: 'from-purple-500 to-purple-700', link: '/admin/exams' },
    { label: 'News Posts', value: stats.news, icon: '📢', color: 'from-green-500 to-green-700', link: '/admin/news' },
    { label: 'Messages', value: stats.messages, icon: '✉️', color: 'from-orange-500 to-orange-700', link: '/admin/settings' },
    { label: 'Paid Fees', value: stats.payments?.paid || 0, icon: '✅', color: 'from-teal-500 to-teal-700', link: '/admin/payments' },
    { label: 'Pending Fees', value: stats.payments?.pending || 0, icon: '⏳', color: 'from-red-500 to-red-700', link: '/admin/payments' },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(card => (
          <Link key={card.label} to={card.link}
            className={`bg-gradient-to-br ${card.color} text-white rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-white text-opacity-80 text-sm mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-lg font-bold text-blue-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Registrations', icon: '📋', link: '/admin/registrations' },
            { label: 'Add Student', icon: '➕', link: '/admin/students' },
            { label: 'Create Exam', icon: '📝', link: '/admin/exams' },
            { label: 'Post News', icon: '📢', link: '/admin/news' },
            { label: 'Record Payment', icon: '💰', link: '/admin/payments' },
            { label: 'Update Settings', icon: '⚙️', link: '/admin/settings' },
          ].map(action => (
            <Link key={action.label} to={action.link}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-yellow-50 hover:border-yellow-200 border border-transparent transition-all text-center">
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
