import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function Results() {
  const { examId } = useParams();
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('gss_token');

  useEffect(() => {
    axios.get(`/api/results/${examId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setResult(res.data.result);
      setQuestions(res.data.questions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [examId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
    </div>
  );

  if (!result) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-gray-600">Result not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const percentage = Math.round((result.score / result.total) * 100);
  const grade = percentage >= 70 ? 'A' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 40 ? 'D' : 'F';
  const gradeColor = percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold">G</div>
          <span className="font-bold">Golden Star School</span>
        </div>
        <Link to="/dashboard" className="px-4 py-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors text-sm font-semibold">
          ← Dashboard
        </Link>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-8 text-white text-center mb-8 shadow-xl">
          <p className="text-blue-300 uppercase tracking-widest text-sm mb-2">Exam Result</p>
          <h2 className="text-2xl font-bold mb-6">{result.exam_title}</h2>
          <div className="flex items-center justify-center gap-8">
            <div>
              <div className={`text-6xl font-bold ${gradeColor} bg-white rounded-2xl w-24 h-24 flex items-center justify-center mx-auto mb-2`}>
                {grade}
              </div>
              <p className="text-blue-200 text-sm">Grade</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-yellow-400">{percentage}%</div>
              <p className="text-blue-200 text-sm mt-1">{result.score} / {result.total} correct</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[['✅ Correct', result.score, 'text-green-300'],
              ['❌ Wrong', result.total - result.score, 'text-red-300'],
              ['📝 Total', result.total, 'text-yellow-300']].map(([label, val, color]) => (
              <div key={label} className="bg-white bg-opacity-10 rounded-xl p-3">
                <p className={`text-2xl font-bold ${color}`}>{val}</p>
                <p className="text-blue-200 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Question Review */}
        <h3 className="text-xl font-bold text-blue-900 mb-4">Question Review</h3>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const studentAnswer = result.answers?.[q.id];
            const correct = studentAnswer === q.correct_option;
            return (
              <div key={q.id} className={`bg-white rounded-2xl p-5 shadow-md border-l-4 ${correct ? 'border-green-400' : 'border-red-400'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${correct ? 'bg-green-500' : 'bg-red-500'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <p className="text-gray-800 font-medium text-sm leading-relaxed">
                    <span className="text-gray-400 mr-2">Q{i + 1}.</span>{q.question_text}
                  </p>
                </div>
                <div className="ml-10 space-y-2">
                  {['a', 'b', 'c', 'd'].map(opt => {
                    const text = q[`option_${opt}`];
                    if (!text) return null;
                    const isCorrect = opt === q.correct_option;
                    const isStudentAnswer = opt === studentAnswer;
                    return (
                      <div key={opt} className={`text-sm px-3 py-2 rounded-lg flex items-center gap-2
                        ${isCorrect ? 'bg-green-50 text-green-700 font-semibold border border-green-200' :
                          isStudentAnswer && !isCorrect ? 'bg-red-50 text-red-700 border border-red-200' :
                          'text-gray-500'}`}>
                        <span className="font-bold">{opt.toUpperCase()}.</span> {text}
                        {isCorrect && <span className="ml-auto text-green-600 text-xs font-bold">✓ Correct</span>}
                        {isStudentAnswer && !isCorrect && <span className="ml-auto text-red-600 text-xs font-bold">Your answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <Link to="/dashboard" className="block w-full text-center mt-8 py-4 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Results;
