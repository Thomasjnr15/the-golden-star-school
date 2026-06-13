import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Exam {
  id: number;
  title: string;
  subject: string;
  class: string;
  date: string;
  start_time: string;
  duration: number;
  published: boolean;
}

interface Question {
  id: number;
  exam_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
}

export default function ManageExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showAddExamDialog, setShowAddExamDialog] = useState(false);
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  
  const [examForm, setExamForm] = useState({
    title: '',
    subject: '',
    class: '',
    date: '',
    start_time: '',
    duration: 60,
  });

  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        toast.error('Failed to load exams');
        console.error(error);
      } else {
        setExams(data || []);
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (examId: number) => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('exam_id', examId)
        .order('id', { ascending: true });

      if (error) {
        toast.error('Failed to load questions');
        console.error(error);
      } else {
        setQuestions(data || []);
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('exams')
        .insert([{
          ...examForm,
          published: false,
        }]);

      if (error) {
        toast.error('Failed to create exam');
        console.error(error);
      } else {
        toast.success('Exam created successfully');
        setExamForm({
          title: '',
          subject: '',
          class: '',
          date: '',
          start_time: '',
          duration: 60,
        });
        setShowAddExamDialog(false);
        fetchExams();
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    try {
      const { error } = await supabase
        .from('questions')
        .insert([{
          exam_id: selectedExam.id,
          ...questionForm,
        }]);

      if (error) {
        toast.error('Failed to add question');
        console.error(error);
      } else {
        toast.success('Question added successfully');
        setQuestionForm({
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'a',
        });
        setShowAddQuestionDialog(false);
        fetchQuestions(selectedExam.id);
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        toast.error('Failed to delete question');
        console.error(error);
      } else {
        toast.success('Question deleted successfully');
        if (selectedExam) {
          fetchQuestions(selectedExam.id);
        }
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  const handlePublishExam = async (examId: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update({ published: !currentStatus })
        .eq('id', examId);

      if (error) {
        toast.error('Failed to update exam');
        console.error(error);
      } else {
        toast.success(`Exam ${!currentStatus ? 'published' : 'unpublished'} successfully`);
        fetchExams();
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  return (
    <Tabs defaultValue="exams" className="w-full">
      <TabsList>
        <TabsTrigger value="exams">Exams</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
      </TabsList>

      {/* Exams Tab */}
      <TabsContent value="exams">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Manage Exams</CardTitle>
                <CardDescription>Create and manage exams</CardDescription>
              </div>
              <Dialog open={showAddExamDialog} onOpenChange={setShowAddExamDialog}>
                <DialogTrigger asChild>
                  <Button>Create Exam</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                    <DialogDescription>Add a new exam to the system</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddExam} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Exam Title</Label>
                      <Input
                        id="title"
                        value={examForm.title}
                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={examForm.subject}
                        onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="class">Class</Label>
                      <Select value={examForm.class} onValueChange={(value) => setExamForm({ ...examForm, class: value })}>
                        <SelectTrigger id="class">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
                            'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'].map(cls => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={examForm.date}
                          onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={examForm.start_time}
                          onChange={(e) => setExamForm({ ...examForm, start_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={examForm.duration}
                        onChange={(e) => setExamForm({ ...examForm, duration: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Exam</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground">Loading exams...</div>
            ) : exams.length === 0 ? (
              <div className="text-center text-muted-foreground">No exams yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.title}</TableCell>
                        <TableCell>{exam.subject}</TableCell>
                        <TableCell>{exam.class}</TableCell>
                        <TableCell>{exam.date}</TableCell>
                        <TableCell>{exam.duration} min</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            exam.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {exam.published ? 'Published' : 'Draft'}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedExam(exam);
                              fetchQuestions(exam.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={exam.published ? 'destructive' : 'default'}
                            onClick={() => handlePublishExam(exam.id, exam.published)}
                          >
                            {exam.published ? 'Unpublish' : 'Publish'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Questions Tab */}
      <TabsContent value="questions">
        {selectedExam ? (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedExam.title} - Questions</CardTitle>
                  <CardDescription>{selectedExam.subject} ({selectedExam.class})</CardDescription>
                </div>
                <div className="space-x-2">
                  <Dialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog}>
                    <DialogTrigger asChild>
                      <Button>Add Question</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Question</DialogTitle>
                        <DialogDescription>Add a new question to this exam</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddQuestion} className="space-y-4">
                        <div>
                          <Label htmlFor="question_text">Question</Label>
                          <Textarea
                            id="question_text"
                            value={questionForm.question_text}
                            onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="option_a">Option A</Label>
                            <Input
                              id="option_a"
                              value={questionForm.option_a}
                              onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="option_b">Option B</Label>
                            <Input
                              id="option_b"
                              value={questionForm.option_b}
                              onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="option_c">Option C</Label>
                            <Input
                              id="option_c"
                              value={questionForm.option_c}
                              onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="option_d">Option D</Label>
                            <Input
                              id="option_d"
                              value={questionForm.option_d}
                              onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="correct_option">Correct Answer</Label>
                          <Select value={questionForm.correct_option} onValueChange={(value) => setQuestionForm({ ...questionForm, correct_option: value })}>
                            <SelectTrigger id="correct_option">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a">Option A</SelectItem>
                              <SelectItem value="b">Option B</SelectItem>
                              <SelectItem value="c">Option C</SelectItem>
                              <SelectItem value="d">Option D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full">Add Question</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={() => setSelectedExam(null)}>Back</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center text-muted-foreground">No questions yet.</div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, idx) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <p className="font-semibold">Q{idx + 1}: {question.question_text}</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className={question.correct_option === 'a' ? 'font-bold text-green-600' : ''}>
                          A: {question.option_a}
                        </div>
                        <div className={question.correct_option === 'b' ? 'font-bold text-green-600' : ''}>
                          B: {question.option_b}
                        </div>
                        <div className={question.correct_option === 'c' ? 'font-bold text-green-600' : ''}>
                          C: {question.option_c}
                        </div>
                        <div className={question.correct_option === 'd' ? 'font-bold text-green-600' : ''}>
                          D: {question.option_d}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Select an exam from the Exams tab to manage its questions.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
