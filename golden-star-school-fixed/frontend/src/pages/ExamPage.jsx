import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const token = localStorage.getItem('gss_token');
  const headers = { Authorization: `Bearer ${token}` };

  // Load exam — timer starts from when student first opens (handled by backend)
  useEffect(() => {
    axios.get(`/api/exams/${examId}`, { headers })
      .then(res => {
        setExam(res.data.exam);
        setQuestions(res.data.questions);

        // Restore saved answers
        const saved = res.data.savedAnswers || {};
        setAnswers(saved);

        // FIX: elapsed_seconds is now time since student OPENED exam, not scheduled time
        const elapsed = res.data.elapsed_seconds || 0;
        const remaining = res.data.exam.duration * 60 - elapsed;
        const safeRemaining = Math.max(0, remaining);

        // If time already expired when they open — auto submit immediately
        if (safeRemaining === 0) {
          setSubmitted(true);
          axios.post(`/api/exams/${examId}/submit`, { answers: saved }, { headers })
            .finally(() => navigate(`/results/${examId}`));
          return;
        }

        setTimeLeft(safeRemaining);
        setLoading(false);
      })
      .catch(err => {
        // FIX: Handle "already submitted" gracefully — go to results
        if (err.response?.status === 409) {
          navigate(`/results/${examId}`);
        } else {
          navigate('/dashboard');
        }
      });
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (!exam || submitted || timeLeft === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [exam, submitted]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!exam || submitted) return;
    autoSaveRef.current = setInterval(() => {
      saveAnswers();
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [exam, answers, submitted]);

  const saveAnswers = async () => {
    setSaving(true);
    try {
      await axios.post(`/api/exams/${examId}/save-answers`, { answers }, { headers });
    } catch {}
    setSaving(false);
  };

  const submitExam = useCallback(async (auto = false) => {
    if (submitted) return;

    // Warn student if not all questions answered (only on manual submit)
    if (!auto) {
      const unanswered = questions.length - Object.keys(answers).length;
      if (unanswered > 0) {
        const confirmed = window.confirm(
          `⚠️ You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}.\n\nAre you sure you want to submit?`
        );
        if (!confirmed) return;
      }
    }

    setSubmitted(true);
    clearInterval(timerRef.current);
    clearInterval(autoSaveRef.current);

    try {
      await axios.post(`/api/exams/${examId}/submit`, { answers }, { headers });
      navigate(`/results/${examId}`);
    } catch {
      navigate('/dashboard');
    }
  }, [answers, examId, submitted, questions]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const answered = Object.keys(answers).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading your exam...</p>
        <p className="text-gray-400 text-sm mt-1">Timer starts when exam loads ⏱</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-700 font-semibold text-lg">Submitting your exam...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait, do not close this page</p>
      </div>
    </div>
  );

  const question = questions[currentQ];

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Poppins, sans-serif' }}>

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="font-bold text-base md:text-lg truncate">{exam?.title}</h1>
              <p className="text-blue-300 text-xs">{exam?.subject} • {exam?.class}</p>
            </div>
            {/* Timer */}
            <div className="flex items-center gap-2 bg-white bg-opacity-10 rounded-xl px-4 py-2 flex-shrink-0">
              <span className="text-lg">⏱</span>
              <span className={`text-2xl font-bold tabular-nums ${timeLeft <= 300 ? 'text-red-300 animate-pulse' : timeLeft <= 600 ? 'text-yellow-300' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white bg-opacity-20 rounded-full h-2">
              <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${questions.length > 0 ? (answered / questions.length) * 100 : 0}%` }} />
            </div>
            <span className="text-xs text-blue-200 flex-shrink-0">{answered}/{questions.length} answered</span>
            {saving && <span className="text-xs text-green-300 flex-shrink-0">💾 Saving...</span>}
          </div>
        </div>

        {/* Low time warning banner */}
        {timeLeft <= 300 && timeLeft > 0 && (
          <div className="bg-red-600 text-white text-center text-xs font-bold py-1.5 animate-pulse">
            ⚠️ Less than 5 minutes remaining! Exam will auto-submit when timer reaches 00:00
          </div>
        )}
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-6">

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
              Question {currentQ + 1} of {questions.length}
            </span>
            {answers[question?.id] && (
              <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-semibold">✓ Answered</span>
            )}
          </div>

          <p className="text-gray-800 font-medium text-base md:text-lg leading-relaxed mb-6">
            {question?.question_text}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {['a', 'b', 'c', 'd'].map(opt => {
              const text = question?.[`option_${opt}`];
              if (!text) return null;
              const selected = answers[question?.id] === opt;
              return (
                <button key={opt}
                  onClick={() => setAnswers({ ...answers, [question.id]: opt })}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 group
                    ${selected
                      ? 'border-yellow-400 bg-yellow-50 text-blue-900'
                      : 'border-gray-100 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                    }`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors
                    ${selected ? 'bg-yellow-400 text-blue-900' : 'bg-white border-2 border-gray-300 text-gray-500 group-hover:border-blue-400'}`}>
                    {opt.toUpperCase()}
                  </span>
                  <span className="pt-1 text-sm md:text-base">{text}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
            disabled={currentQ === 0}
            className="flex-1 py-3 border-2 border-blue-900 text-blue-900 font-semibold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            ← Previous
          </button>
          {currentQ < questions.length - 1 ? (
            <button onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex-1 py-3 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-800 transition-colors">
              Next →
            </button>
          ) : (
            <button onClick={() => submitExam(false)}
              className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
              Submit Exam ✓
            </button>
          )}
        </div>

        {/* Question Grid Navigator */}
        <div className="bg-white rounded-2xl p-5 shadow-md">
          <p className="text-sm font-semibold text-gray-600 mb-3">Question Navigator</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => setCurrentQ(i)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all
                  ${i === currentQ ? 'bg-blue-900 text-white ring-2 ring-blue-300' :
                    answers[q.id] ? 'bg-yellow-400 text-blue-900' :
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {i + 1}
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-400 rounded inline-block" /> Answered</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-blue-900 rounded inline-block" /> Current</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-100 border rounded inline-block" /> Not answered</span>
          </div>
        </div>

        {/* Final Submit Button */}
        <button onClick={() => submitExam(false)}
          className="w-full mt-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-lg shadow-md">
          Submit Exam ({answered}/{questions.length} answered) ✓
        </button>
      </div>
    </div>
  );
}

export default ExamPage;
