import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('gss_token');
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('/api/exams/my-exams', { headers }),
      axios.get('/api/results/my-results', { headers }),
    ]).then(([examsRes, resultsRes]) => {
      setExams(examsRes.data);
      setResults(resultsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getExamStatus = (exam) => {
    const result = results.find(r => r.exam_id === exam.id);
    if (result) return {
      label: 'Completed',
      color: 'green',
      score: result.score,
      total: result.total
    };

    const now = new Date();
    // FIX: Exam is available from its scheduled date onward (not time-locked)
    // Timer starts when student opens — so just show "Available" once date arrives
    const examDate = new Date(exam.date + 'T00:00:00'); // start of exam day
    const examDeadline = new Date(exam.date + 'T23:59:59'); // end of exam day

    if (now < examDate) return { label: 'Upcoming', color: 'blue' };
    if (now > examDeadline) return { label: 'Missed', color: 'red' };
    return { label: 'Available Today', color: 'yellow' };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC', fontFamily: 'Poppins, sans-serif' }}>

      {/* Top Bar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold">G</div>
          <span className="font-bold hidden sm:block">Golden Star School</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-300 text-sm hidden sm:block">Welcome, {user?.full_name}</span>
          <button onClick={() => { logout(); navigate('/student-login'); }}
            className="px-4 py-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors text-sm font-semibold">
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto max-w-5xl px-4 py-8">

        {/* Student Info Card */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-2xl flex-shrink-0">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{user?.full_name}</h2>
              <p className="text-blue-200 mt-1">Class: <span className="text-yellow-400 font-semibold">{user?.class}</span></p>
              <p className="text-blue-200">Reg. No: <span className="text-yellow-400 font-semibold">{user?.registration_number}</span></p>
            </div>
            <div className="sm:ml-auto text-center sm:text-right">
              <div className="bg-white bg-opacity-10 rounded-xl px-4 py-2">
                <p className="text-blue-200 text-xs">Exams Completed</p>
                <p className="text-2xl font-bold text-yellow-400">{results.length}/{exams.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Exam timer info notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 flex items-start gap-3">
          <span className="text-blue-500 text-lg flex-shrink-0">ℹ️</span>
          <p className="text-blue-700 text-sm">
            <strong>How exams work:</strong> Your timer starts the moment you click "Start Exam". 
            You have the full duration from that point. Do not start until you are ready.
          </p>
        </div>

        {/* Exams List */}
        <h3 className="text-xl font-bold text-blue-900 mb-4">My Exams</h3>
        {exams.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-md">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 font-medium">No exams assigned yet. Check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map(exam => {
              const status = getExamStatus(exam);
              const colorMap = {
                green: 'bg-green-50 border-green-200 text-green-700',
                blue: 'bg-blue-50 border-blue-200 text-blue-700',
                yellow: 'bg-yellow-50 border-yellow-300 text-yellow-700',
                red: 'bg-red-50 border-red-200 text-red-700',
              };
              return (
                <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-blue-900 text-lg">{exam.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{exam.subject} • {exam.class}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colorMap[status.color]}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">Exam Date</p>
                      <p className="font-semibold text-gray-700">{new Date(exam.date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">Duration</p>
                      <p className="font-semibold text-gray-700">{exam.duration} minutes</p>
                    </div>
                  </div>

                  {status.label === 'Completed' ? (
                    <div className="flex items-center justify-between">
                      <div className="bg-green-50 rounded-xl px-4 py-2">
                        <span className="text-green-700 font-bold">Score: {status.score}/{status.total}</span>
                        <span className="text-green-600 text-sm ml-2">({Math.round(status.score / status.total * 100)}%)</span>
                      </div>
                      <Link to={`/results/${exam.id}`} className="text-blue-600 font-semibold text-sm hover:underline">View Details →</Link>
                    </div>

                  ) : status.label === 'Available Today' ? (
                    <Link to={`/exam/${exam.id}`}
                      className="block w-full text-center bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl hover:bg-yellow-300 transition-colors">
                      🟢 Start Exam — Timer Begins Now
                    </Link>

                  ) : status.label === 'Upcoming' ? (
                    <div className="text-center py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-400 text-sm font-medium">
                      ⏳ Available on {new Date(exam.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </div>

                  ) : (
                    <div className="text-center py-3 border-2 border-dashed border-red-200 rounded-xl text-red-400 text-sm font-medium">
                      ❌ Exam date has passed
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
