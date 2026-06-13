import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2, Zap } from 'lucide-react';

interface GeneratedQuestion {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
}

export default function AIQuestionGenerator() {
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [exams, setExams] = useState<any[]>([]);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Fetch exams on component mount
  useState(() => {
    fetchExams();
  });

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('id, title, subject, class')
        .order('date', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    }
  };

  const generateQuestions = async () => {
    if (!selectedExam || !topic || !groqApiKey) {
      toast.error('Please fill in all fields and provide Groq API key');
      return;
    }

    setLoading(true);
    try {
      const exam = exams.find(e => e.id === selectedExam);
      const prompt = `Generate ${numberOfQuestions} multiple-choice exam questions for a ${difficulty} level exam about "${topic}" in the subject of ${exam?.subject}.

Each question should have:
- A clear question text
- 4 options (a, b, c, d)
- One correct answer

Format your response as a JSON array with this structure:
[
  {
    "question_text": "Question here?",
    "option_a": "Option A",
    "option_b": "Option B",
    "option_c": "Option C",
    "option_d": "Option D",
    "correct_option": "a"
  }
]

Only return the JSON array, no other text.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate questions');
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }

      const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0]);

      // Validate questions
      const validQuestions = questions.filter(q =>
        q.question_text &&
        q.option_a &&
        q.option_b &&
        q.option_c &&
        q.option_d &&
        ['a', 'b', 'c', 'd'].includes(q.correct_option)
      );

      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      setGeneratedQuestions(validQuestions);
      toast.success(`Generated ${validQuestions.length} questions`);
    } catch (error: any) {
      console.error('Error generating questions:', error);
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const saveQuestions = async () => {
    if (!selectedExam || generatedQuestions.length === 0) {
      toast.error('No questions to save');
      return;
    }

    setSaving(true);
    try {
      const questionsToInsert = generatedQuestions.map(q => ({
        exam_id: selectedExam,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
      }));

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (error) throw error;

      toast.success(`Saved ${generatedQuestions.length} questions to exam`);
      setGeneratedQuestions([]);
      setTopic('');
    } catch (error) {
      console.error('Error saving questions:', error);
      toast.error('Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Question Generator
          </CardTitle>
          <CardDescription>Generate exam questions using AI powered by Groq</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Input */}
          <div>
            <Button
              variant="outline"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="mb-4"
            >
              {showApiKeyInput ? 'Hide' : 'Show'} Groq API Key Input
            </Button>

            {showApiKeyInput && (
              <div className="p-4 bg-muted rounded-lg space-y-2 mb-4">
                <Label htmlFor="api-key">Groq API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your Groq API key"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get your free API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.groq.com</a>
                </p>
              </div>
            )}
          </div>

          {/* Generation Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exam-select">Select Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger id="exam-select">
                  <SelectValue placeholder="Choose an exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.subject} - {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty-select">Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="topic">Topic/Subject Matter</Label>
              <Input
                id="topic"
                placeholder="e.g., Photosynthesis, Quadratic Equations"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="num-questions">Number of Questions</Label>
              <Input
                id="num-questions"
                type="number"
                min="1"
                max="20"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={generateQuestions}
            disabled={loading || !selectedExam || !topic || !groqApiKey}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Questions with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions ({generatedQuestions.length})</CardTitle>
            <CardDescription>Review and save the AI-generated questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedQuestions.map((question, index) => (
              <div key={index} className="p-4 border rounded-lg bg-muted/50">
                <p className="font-semibold mb-3">
                  <span className="text-primary">Q{index + 1}:</span> {question.question_text}
                </p>
                <div className="space-y-2 ml-4">
                  {(['a', 'b', 'c', 'd'] as const).map(option => (
                    <div
                      key={option}
                      className={`p-2 rounded ${
                        question.correct_option === option
                          ? 'bg-green-100 border border-green-300'
                          : 'bg-background'
                      }`}
                    >
                      <span className="font-semibold">{option.toUpperCase()}:</span> {question[`option_${option}`]}
                      {question.correct_option === option && (
                        <span className="ml-2 text-xs font-semibold text-green-700">✓ Correct</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button
              onClick={saveQuestions}
              disabled={saving}
              className="w-full"
              size="lg"
            >
              {saving ? 'Saving...' : `Save ${generatedQuestions.length} Questions to Exam`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
