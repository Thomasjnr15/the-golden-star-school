import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Plus, Trash2, BookOpen } from 'lucide-react';

const STREAMS = ['Science', 'Arts', 'Commercial'] as const;
type Stream = typeof STREAMS[number];

interface Subject {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface StreamSubject {
  id: string;
  stream: Stream;
  subject_id: string;
  is_compulsory: boolean;
  subject?: { name: string; is_active: boolean };
}

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [streamSubjects, setStreamSubjects] = useState<StreamSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStream, setSelectedStream] = useState<Stream>('Science');

  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [assignForm, setAssignForm] = useState({
    subject_id: '',
    stream: 'Science' as Stream,
    is_compulsory: true,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, ssRes] = await Promise.all([
        supabase.from('subjects').select('*').order('name'),
        supabase.from('stream_subjects').select('*, subject:subject_id(name, is_active)').order('stream'),
      ]);
      if (subRes.error) throw subRes.error;
      if (ssRes.error) throw ssRes.error;
      setSubjects(subRes.data || []);
      setStreamSubjects(ssRes.data || []);
    } catch (err: any) {
      toast.error('Failed to load subjects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) { toast.error('Subject name is required'); return; }
    const { error } = await supabase.from('subjects').insert([{ name, is_active: true }]);
    if (error) { toast.error('Failed to add subject: ' + error.message); return; }
    toast.success(`Subject "${name}" added`);
    setNewSubjectName('');
    setShowAddSubjectDialog(false);
    fetchAll();
  };

  const handleToggleSubjectActive = async (subject: Subject) => {
    const { error } = await supabase
      .from('subjects')
      .update({ is_active: !subject.is_active })
      .eq('id', subject.id);
    if (error) { toast.error('Failed to update subject'); return; }
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, is_active: !s.is_active } : s));
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!confirm(`Delete subject "${subject.name}"? This will also remove all stream assignments.`)) return;
    const { error } = await supabase.from('subjects').delete().eq('id', subject.id);
    if (error) { toast.error('Failed to delete: ' + error.message); return; }
    toast.success('Subject deleted');
    fetchAll();
  };

  const handleAssignToStream = async () => {
    if (!assignForm.subject_id) { toast.error('Select a subject'); return; }
    const { error } = await supabase.from('stream_subjects').insert([{
      stream: assignForm.stream,
      subject_id: assignForm.subject_id,
      is_compulsory: assignForm.is_compulsory,
    }]);
    if (error) {
      if (error.code === '23505') { toast.error('Subject already assigned to this stream'); return; }
      toast.error('Failed to assign: ' + error.message);
      return;
    }
    toast.success('Subject assigned to stream');
    setShowAssignDialog(false);
    fetchAll();
  };

  const handleRemoveFromStream = async (id: string, subjectName: string, stream: string) => {
    if (!confirm(`Remove "${subjectName}" from ${stream} stream?`)) return;
    const { error } = await supabase.from('stream_subjects').delete().eq('id', id);
    if (error) { toast.error('Failed to remove: ' + error.message); return; }
    toast.success('Removed from stream');
    fetchAll();
  };

  const handleToggleCompulsory = async (ss: StreamSubject) => {
    const { error } = await supabase
      .from('stream_subjects')
      .update({ is_compulsory: !ss.is_compulsory })
      .eq('id', ss.id);
    if (error) { toast.error('Failed to update'); return; }
    setStreamSubjects(prev =>
      prev.map(s => s.id === ss.id ? { ...s, is_compulsory: !s.is_compulsory } : s)
    );
  };

  const streamItems = streamSubjects.filter(ss => ss.stream === selectedStream);
  // subjects not yet in this stream
  const unassignedSubjects = subjects.filter(
    s => s.is_active && !streamSubjects.some(ss => ss.stream === selectedStream && ss.subject_id === s.id)
  );

  if (loading) return <div className="text-center text-muted-foreground py-8">Loading subjects…</div>;

  return (
    <div className="space-y-6">
      {/* Global Subjects */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Subject Master List
              </CardTitle>
              <CardDescription>All subjects in the system. Deactivating hides from assignment but preserves history.</CardDescription>
            </div>
            <Dialog open={showAddSubjectDialog} onOpenChange={setShowAddSubjectDialog}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Subject</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                  <DialogDescription>Add a subject to the master list. Then assign it to streams.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Subject Name</Label>
                    <Input
                      placeholder="e.g. Computer Science"
                      value={newSubjectName}
                      onChange={e => setNewSubjectName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                    />
                  </div>
                  <Button onClick={handleAddSubject} className="w-full">Add Subject</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Assigned Streams</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map(subject => {
                  const streams = streamSubjects
                    .filter(ss => ss.subject_id === subject.id)
                    .map(ss => ss.stream);
                  return (
                    <TableRow key={subject.id} className={!subject.is_active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {streams.length === 0
                            ? <span className="text-xs text-muted-foreground">Not assigned</span>
                            : streams.map(s => (
                              <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                            ))
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={subject.is_active}
                          onCheckedChange={() => handleToggleSubjectActive(subject)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSubject(subject)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stream Assignments */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Stream Subject Assignments</CardTitle>
              <CardDescription>
                Control which subjects belong to each stream and whether they are compulsory or optional.
              </CardDescription>
            </div>
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Assign Subject</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Subject to Stream</DialogTitle>
                  <DialogDescription>A subject can belong to multiple streams.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Stream</Label>
                    <Select
                      value={assignForm.stream}
                      onValueChange={v => setAssignForm(f => ({ ...f, stream: v as Stream }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STREAMS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Select
                      value={assignForm.subject_id}
                      onValueChange={v => setAssignForm(f => ({ ...f, subject_id: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select subject…" /></SelectTrigger>
                      <SelectContent>
                        {subjects.filter(s => s.is_active).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={assignForm.is_compulsory}
                      onCheckedChange={v => setAssignForm(f => ({ ...f, is_compulsory: v }))}
                    />
                    <Label>{assignForm.is_compulsory ? 'Compulsory' : 'Optional'}</Label>
                  </div>
                  <Button onClick={handleAssignToStream} className="w-full">Assign to Stream</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStream} onValueChange={v => setSelectedStream(v as Stream)}>
            <TabsList>
              {STREAMS.map(s => (
                <TabsTrigger key={s} value={s}>
                  {s}
                  <Badge variant="outline" className="ml-2 text-xs">
                    {streamSubjects.filter(ss => ss.stream === s).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {STREAMS.map(stream => (
              <TabsContent key={stream} value={stream}>
                {streamItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No subjects assigned to {stream} stream yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Compulsory</TableHead>
                        <TableHead className="text-center">Remove</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {streamItems.map(ss => (
                        <TableRow key={ss.id}>
                          <TableCell className="font-medium">{ss.subject?.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={ss.is_compulsory ? 'default' : 'secondary'}>
                              {ss.is_compulsory ? 'Compulsory' : 'Optional'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={ss.is_compulsory}
                              onCheckedChange={() => handleToggleCompulsory(ss)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveFromStream(ss.id, ss.subject?.name || '', ss.stream)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {unassignedSubjects.length > 0 && selectedStream === stream && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {unassignedSubjects.length} active subject{unassignedSubjects.length > 1 ? 's' : ''} not yet in this stream.
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
