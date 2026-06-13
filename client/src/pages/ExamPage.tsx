import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Question {
  id: string;  // FIX: UUID not number
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  // correct_option intentionally omitted — never sent to student browser
}

interface Exam {
  id: string;  // FIX: UUID not number
  title: string;
  subject: string;
  duration: number;
}

export default function ExamPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/student/exam/:examId');
  const { user } = useAuth();
  // FIX: examId stays as UUID string — no parseInt
  const examId = params?.examId ?? null;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const answersRef = useRef<Record<string, string>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep ref in sync so timer callbacks have fresh answers
  useEffect(() => { answersRef.current = answers; }, [answers]);

  // Load exam on mount
  useEffect(() => {
    if (!examId || !user?.id) return;
    loadExam();
  }, [examId, user?.id]);

  const loadExam = async () => {
    try {
      // FIX: get student record ID (students.id) from auth user ID
      const { data: studentRecord } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (!studentRecord) {
        toast.error('Student record not found. Contact your admin.');
        setLocation('/student/dashboard');
        return;
      }
      const studentId = studentRecord.id;

      // Get exam details
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('id, title, subject, duration')
        .eq('id', examId)
        .single();

      if (examError || !examData) {
        toast.error('Exam not found');
        setLocation('/student/dashboard');
        return;
      }
      setExam(examData);

      // Check already submitted
      const { data: existingResult } = await supabase
        .from('exam_results')
        .select('id')
        .eq('exam_id', examId)
        .eq('student_id', studentId)
        .single();

      if (existingResult) {
        toast.info('You have already submitted this exam.');
        setLocation('/student/results');
        return;
      }

      // FIX: column is question_order (UUID[]), not questions_snapshot
      const { data: sessionData } = await supabase
        .from('exam_sessions')
        .select('question_order, started_at')
        .eq('student_id', studentId)
        .eq('exam_id', examId)
        .single();

      let orderedQuestions: Question[] = [];

      if (sessionData?.question_order?.length > 0) {
        // Restore snapshot order
        const { data: allQs } = await supabase
          .from('questions')
          .select('id, question_text, option_a, option_b, option_c, option_d')
          .eq('exam_id', examId);

        const qMap = Object.fromEntries((allQs || []).map(q => [q.id, q]));
        orderedQuestions = sessionData.question_order
          .map((qId: string) => qMap[qId])
          .filter(Boolean);

        // FIX: timer based on when student FIRST opened, not scheduled time
        const elapsed = Math.floor((Date.now() - new Date(sessionData.started_at).getTime()) / 1000);
        const remaining = Math.max(0, examData.duration * 60 - elapsed);
        if (remaining === 0) {
          await submitExam(studentId, orderedQuestions, answersRef.current);
          return;
        }
        setTimeRemaining(remaining);
      } else {
        // First open — fetch and shuffle questions (without correct_option)
        const { data: rawQs } = await supabase
          .from('questions')
          .select('id, question_text, option_a, option_b, option_c, option_d')
          .eq('exam_id', examId);

        if (!rawQs?.length) {
          toast.error('No questions found for this exam.');
          setLocation('/student/dashboard');
          return;
        }

        // Fisher-Yates shuffle
        const shuffled = [...rawQs];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        orderedQuestions = shuffled;

        // Save session with question_order snapshot
        await supabase.from('exam_sessions').insert([{
          student_id: studentId,
          exam_id: examId,
          question_order: shuffled.map(q => q.id),
          started_at: new Date().toISOString(),
        }]);

        setTimeRemaining(examData.duration * 60);
      }

      setQuestions(orderedQuestions);

      // Restore saved answers
      const { data: savedAnswers } = await supabase
        .from('student_answers')
        .select('question_id, selected_option')
        .eq('student_id', studentId)
        .eq('exam_id', examId);

      if (savedAnswers?.length) {
        const map: Record<string, string> = {};
        savedAnswers.forEach(a => { if (a.selected_option) map[a.question_id] = a.selected_option; });
        setAnswers(map);
        answersRef.current = map;
      }

    } catch (err) {
      console.error('Exam load error:', err);
      toast.error('Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!exam || submitted || timeRemaining === 0) return;
    timerRef.current = setInterval(async () => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [exam, submitted]);

  // Auto-save every 15 seconds
  useEffect(() => {
    if (!exam || submitted) return;
    autoSaveRef.current = setInterval(() => saveAnswers(answersRef.current), 15000);
    return () => clearInterval(autoSaveRef.current!);
  }, [exam, submitted]);

  const saveAnswers = async (currentAnswers: Record<string, string>) => {
    if (!user?.id || Object.keys(currentAnswers).length === 0) return;
    setSaving(true);
    try {
      const { data: studentRecord } = await supabase
        .from('students').select('id').eq('user_id', user.id).single();
      if (!studentRecord) return;

      const rows = Object.entries(currentAnswers).map(([question_id, selected_option]) => ({
        student_id: studentRecord.id,
        exam_id: examId!,
        question_id,
        selected_option,
        saved_at: new Date().toISOString(),
      }));
      await supabase.from('student_answers')
        .upsert(rows, { onConflict: 'student_id,exam_id,question_id' });
    } catch (err) {
      console.error('Auto-save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSubmit = () => {
    toast.info('Time is up! Submitting your exam...');
    handleSubmit(true);
  };

  const handleSubmit = async (auto = false) => {
    if (submitted) return;

    if (!auto) {
      const unanswered = questions.length - Object.keys(answersRef.current).length;
      if (unanswered > 0 && !confirmSubmit) {
        setConfirmSubmit(true);
        return;
      }
    }
    setConfirmSubmit(false);

    setSubmitted(true);
    clearInterval(timerRef.current!);
    clearInterval(autoSaveRef.current!);

    const { data: studentRecord } = await supabase
      .from('students').select('id').eq('user_id', user!.id).single();
    if (!studentRecord) return;

    await submitExam(studentRecord.id, questions, answersRef.current);
  };

  const submitExam = useCallback(async (
    studentId: string,
    qs: Question[],
    finalAnswers: Record<string, string>
  ) => {
    // Save all answers first
    if (Object.keys(finalAnswers).length > 0) {
      const rows = Object.entries(finalAnswers).map(([question_id, selected_option]) => ({
        student_id: studentId,
        exam_id: examId!,
        question_id,
        selected_option,
        saved_at: new Date().toISOString(),
      }));
      await supabase.from('student_answers')
        .upsert(rows, { onConflict: 'student_id,exam_id,question_id' });
    }

    // Calculate score server-side via Postgres function
    const { data: result, error } = await supabase.rpc('submit_exam', {
      p_student_id: studentId,
      p_exam_id: examId,
    });

    if (error) {
      toast.error('Failed to submit exam. Please contact your teacher.');
      console.error('Submit error:', error);
      return;
    }

    if (result?.success) {
      toast.success(`Exam submitted! Score: ${result.score}/${result.total} (${result.percentage}%)`);
      setLocation('/student/results');
    } else {
      toast.error(result?.error || 'Submission failed');
    }
  }, [examId]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const answered = Object.keys(answers).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading exam... Timer starts when exam loads ⏱</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Submitting your exam... Please wait.</p>
      </div>
    </div>
  );

  const question = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        <div className="container py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{exam?.title}</h1>
            <p className="text-sm opacity-80">{exam?.subject}</p>
          </div>
          <div className="flex items-center gap-4">
            {saving && <span className="text-xs opacity-70">💾 Saving...</span>}
            <div className={`text-2xl font-bold tabular-nums ${timeRemaining <= 300 ? 'text-red-300 animate-pulse' : ''}`}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
        {/* Progress */}
        <div className="container pb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${questions.length > 0 ? (answered / questions.length) * 100 : 0}%` }} />
            </div>
            <span className="text-xs opacity-80">{answered}/{questions.length}</span>
          </div>
        </div>
        {timeRemaining <= 300 && timeRemaining > 0 && (
          <div className="bg-destructive text-destructive-foreground text-center text-xs font-bold py-1 animate-pulse">
            ⚠️ Less than 5 minutes! Exam auto-submits at 00:00
          </div>
        )}
      </div>

      <div className="container max-w-3xl py-6">
        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-primary">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {answers[question?.id] && (
                <span className="text-xs text-green-600 font-semibold">✓ Answered</span>
              )}
            </div>
            <p className="text-base font-medium mb-6 leading-relaxed">{question?.question_text}</p>
            <div className="space-y-3">
              {(['a', 'b', 'c', 'd'] as const).map(opt => {
                const text = question?.[`option_${opt}`];
                if (!text) return null;
                const selected = answers[question?.id] === opt;
                return (
                  <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [question.id]: opt }))}
                    className={`w-full text-left p-4 rounded-lg border-2 flex items-start gap-3 transition-all
                      ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {opt.toUpperCase()}
                    </span>
                    <span className="pt-0.5 text-sm">{text}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mb-6">
          <Button variant="outline" onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0} className="flex-1">← Previous</Button>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))}
              className="flex-1">Next →</Button>
          ) : (
            <Button onClick={() => handleSubmit(false)} variant="default" className="flex-1 bg-green-600 hover:bg-green-700">
              Submit Exam ✓
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Question Navigator</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, i) => (
                <button key={q.id} onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all
                    ${i === currentQuestionIndex ? 'bg-primary text-primary-foreground ring-2 ring-primary/30' :
                      answers[q.id] ? 'bg-green-500 text-white' :
                      'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Answered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary rounded" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-muted rounded" /> Not answered</span>
            </div>
          </CardContent>
        </Card>

        {/* Confirm submit banner — replaces window.confirm */}
        {confirmSubmit && (
          <div className="mb-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4 text-sm">
            <p className="font-bold text-amber-800 mb-1">⚠️ You have unanswered questions</p>
            <p className="text-amber-700 mb-3">
              You have {questions.length - Object.keys(answers).length} unanswered question{questions.length - Object.keys(answers).length !== 1 ? 's' : ''}. Are you sure you want to submit now?
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleSubmit(false)} className="px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-bold hover:bg-green-800">
                Yes, Submit Now
              </button>
              <button onClick={() => setConfirmSubmit(false)} className="px-4 py-2 border border-amber-400 text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-100">
                Go Back & Answer
              </button>
            </div>
          </div>
        )}

        <Button onClick={() => handleSubmit(false)} className="w-full bg-green-600 hover:bg-green-700 py-6 text-base font-bold">
          Submit Exam ({answered}/{questions.length} answered) ✓
        </Button>
      </div>
    </div>
  );
}
