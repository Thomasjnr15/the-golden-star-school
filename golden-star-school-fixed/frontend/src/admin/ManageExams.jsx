import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminDashboard';
import axios from 'axios';

const CLASSES = ['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JSS 1','JSS 2','JSS 3','SSS 1','SSS 2','SSS 3'];

function ManageExams() {
  const [exams, setExams] = useState([]);
  const [selected, setSelected] = useState(null); // selected exam for questions
  const [questions, setQuestions] = useState([]);
  const [examModal, setExamModal] = useState(false);
  const [qModal, setQModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [examForm, setExamForm] = useState({ title: '', subject: '', class: 'Primary 1', date: '', start_time: '', duration: 30 });
  const [qForm, setQForm] = useState({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' });
  const [msg, setMsg] = useState('');
  const token = localStorage.getItem('gss_token');
  const headers = { Authorization: `Bearer ${token}` };

  const loadExams = () => axios.get('/api/exams', { headers }).then(r => setExams(r.data)).catch(() => {});
  const loadQuestions = (examId) => axios.get(`/api/exams/${examId}/questions`, { headers }).then(r => setQuestions(r.data)).catch(() => {});

  useEffect(() => { loadExams(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const saveExam = async () => {
    try {
      if (editingExam) await axios.put(`/api/exams/${editingExam.id}`, examForm, { headers });
      else await axios.post('/api/exams', examForm, { headers });
      setExamModal(false);
      loadExams();
      flash(editingExam ? 'Exam updated!' : 'Exam created!');
    } catch (e) { flash(e.response?.data?.message || 'Error'); }
  };

  const deleteExam = async (id) => {
    if (!window.confirm('Delete this exam and all its questions?')) return;
    await axios.delete(`/api/exams/${id}`, { headers });
    if (selected?.id === id) setSelected(null);
    loadExams();
  };

  const selectExam = (exam) => { setSelected(exam); loadQuestions(exam.id); };

  const saveQuestion = async () => {
    try {
      if (editingQ) await axios.put(`/api/questions/${editingQ.id}`, qForm, { headers });
      else await axios.post(`/api/exams/${selected.id}/questions`, qForm, { headers });
      setQModal(false);
      loadQuestions(selected.id);
      flash(editingQ ? 'Question updated!' : 'Question added!');
    } catch (e) { flash(e.response?.data?.message || 'Error'); }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    await axios.delete(`/api/questions/${id}`, { headers });
    loadQuestions(selected.id);
  };

  const openAddExam = () => { setEditingExam(null); setExamForm({ title: '', subject: '', class: 'Primary 1', date: '', start_time: '', duration: 30 }); setExamModal(true); };
  const openEditExam = (e) => { setEditingExam(e); setExamForm({ title: e.title, subject: e.subject, class: e.class, date: e.date?.slice(0,10), start_time: e.start_time, duration: e.duration }); setExamModal(true); };
  const openAddQ = () => { setEditingQ(null); setQForm({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' }); setQModal(true); };
  const openEditQ = (q) => { setEditingQ(q); setQForm({ question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option }); setQModal(true); };

  return (
    <AdminLayout title="Manage Exams & CBT">
      {msg && <div className={`mb-4 p-4 rounded-xl text-sm font-semibold ${msg.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exams List */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-blue-900">All Exams</h3>
            <button onClick={openAddExam} className="px-4 py-2 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors text-sm">+ New Exam</button>
          </div>
          <div className="divide-y divide-gray-50">
            {exams.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No exams yet. Create one!</div>
            ) : exams.map(exam => (
              <div key={exam.id}
                onClick={() => selectExam(exam)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === exam.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-semibold text-gray-800 text-sm truncate">{exam.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{exam.subject} • {exam.class}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(exam.date).toLocaleDateString()} {exam.start_time} • {exam.duration}min</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); openEditExam(exam); }} className="text-blue-600 text-xs hover:underline">✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteExam(exam.id); }} className="text-red-500 text-xs hover:underline">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions Panel */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-blue-900">{selected ? `Questions: ${selected.title}` : 'Select an exam'}</h3>
            {selected && (
              <button onClick={openAddQ} className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm">+ Add Question</button>
            )}
          </div>
          {!selected ? (
            <div className="py-12 text-center text-gray-400">← Click an exam to manage its questions</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {questions.length === 0 ? (
                <div className="py-12 text-center text-gray-400">No questions yet. Add some!</div>
              ) : questions.map((q, i) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700 font-medium flex-1"><span className="text-blue-900 font-bold mr-1">Q{i+1}.</span>{q.question_text}</p>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => openEditQ(q)} className="text-blue-600 text-xs hover:underline">✏️</button>
                      <button onClick={() => deleteQuestion(q.id)} className="text-red-500 text-xs hover:underline">🗑️</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {['a','b','c','d'].map(opt => (
                      <span key={opt} className={`text-xs px-2 py-1 rounded-lg ${q.correct_option === opt ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-50 text-gray-500'}`}>
                        {opt.toUpperCase()}. {q[`option_${opt}`]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Exam Modal */}
      {examModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-blue-900 mb-5">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h3>
            <div className="space-y-4">
              {[['Exam Title', 'title', 'text', 'e.g. First Term Mathematics'],
                ['Subject', 'subject', 'text', 'e.g. Mathematics']].map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input type={type} placeholder={ph} value={examForm[key]} onChange={e => setExamForm({ ...examForm, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
                <select value={examForm.class} onChange={e => setExamForm({ ...examForm, class: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                  <input type="date" value={examForm.date} onChange={e => setExamForm({ ...examForm, date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time</label>
                  <input type="time" value={examForm.start_time} onChange={e => setExamForm({ ...examForm, start_time: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (minutes)</label>
                <input type="number" min={5} max={180} value={examForm.duration} onChange={e => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setExamModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={saveExam} className="flex-1 py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 text-sm">
                {editingExam ? 'Update Exam' : 'Create Exam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {qModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-blue-900 mb-5">{editingQ ? 'Edit Question' : 'Add Question'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Text</label>
                <textarea rows={3} placeholder="Type your question here..." value={qForm.question_text}
                  onChange={e => setQForm({ ...qForm, question_text: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
              </div>
              {['a','b','c','d'].map(opt => (
                <div key={opt}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option {opt.toUpperCase()}</label>
                  <input type="text" placeholder={`Option ${opt.toUpperCase()}`} value={qForm[`option_${opt}`]}
                    onChange={e => setQForm({ ...qForm, [`option_${opt}`]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correct Answer</label>
                <select value={qForm.correct_option} onChange={e => setQForm({ ...qForm, correct_option: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {['a','b','c','d'].map(o => <option key={o} value={o}>Option {o.toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setQModal(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={saveQuestion} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm">
                {editingQ ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default ManageExams;
