import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Result {
  id: number;
  exam_id: number;
  score: number;
  total: number;
  submitted_at: string;
  exam?: {
    title: string;
    subject: string;
  };
}

export default function Results() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!user?.id) return;

      try {
        // FIX: exam_results.student_id references students.id not auth.users.id
        const { data: studentRecord } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!studentRecord) {
          toast.error('Student record not found');
          return;
        }

        const { data, error } = await supabase
          .from('exam_results')
          .select('*, exams(title, subject)')
          .eq('student_id', studentRecord.id)
          .eq('is_published', true)
          .order('submitted_at', { ascending: false });

        if (error) {
          toast.error('Failed to load results');
          console.error(error);
        } else {
          // exams already joined via select('*, exams(title, subject)')
          setResults(data || []);
        }
      } catch (error) {
        toast.error('An error occurred');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const getPercentage = (score: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((score / total) * 100);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Exam Results</h1>
            <p className="text-sm text-muted-foreground">{user?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setLocation('/student/dashboard')}>
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading results...</div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No exam results yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result) => {
              const percentage = getPercentage(result.score, result.total);
              const grade = getGrade(percentage);
              const submittedDate = new Date(result.submitted_at);

              return (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{result.exam?.title || 'Exam'}</CardTitle>
                        <CardDescription>{result.exam?.subject || 'Subject'}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{grade}</div>
                        <p className="text-sm text-muted-foreground">{percentage}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="font-semibold">{result.score}/{result.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Percentage</p>
                        <p className="font-semibold">{percentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Correct</p>
                        <p className="font-semibold text-green-600">{result.score}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Incorrect</p>
                        <p className="font-semibold text-red-600">{result.total - result.score}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Submitted: {submittedDate.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
