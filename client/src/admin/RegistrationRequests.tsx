import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SSS_CLASSES = ['SSS 1', 'SSS 2', 'SSS 3'];
const STREAMS = ['Science', 'Arts', 'Commercial'] as const;

interface RegistrationRequest {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  class_applying: string;
  requested_stream: string | null;
  previous_school: string | null;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  home_address: string | null;
  additional_info: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
}

export default function RegistrationRequests() {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'all'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    registrationNumber: '',
    password: '',
    assignedClass: '',
    assignedStream: '',
  });
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('registration_requests')
        .select('*')
        .order('submitted_at', { ascending: false });
      if (filterStatus === 'pending') q = q.eq('status', 'pending');
      const { data, error } = await q;
      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      toast.error('Failed to load requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (req: RegistrationRequest) => {
    setSelectedRequest(req);
    setApprovalForm({
      registrationNumber: '',
      password: '',
      assignedClass: req.class_applying,
      assignedStream: req.requested_stream || '',
    });
    setShowDetailsDialog(true);
  };

  const handleApproveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!approvalForm.registrationNumber.trim()) {
      toast.error('Registration number required');
      return;
    }
    if (!approvalForm.password.trim()) {
      toast.error('Initial password required');
      return;
    }
    if (approvalForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (SSS_CLASSES.includes(approvalForm.assignedClass) && !approvalForm.assignedStream) {
      toast.error('Stream is required for SSS classes');
      return;
    }

    setApproving(true);

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        toast.error('Authentication required. Please log in again.');
        setApproving(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          registrationNumber: approvalForm.registrationNumber,
          fullName: selectedRequest.full_name,
          password: approvalForm.password,
          class: approvalForm.assignedClass,
          stream: approvalForm.assignedStream || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve student');
      }

      toast.success(`✅ ${selectedRequest.full_name} approved! Login: ${approvalForm.registrationNumber}`);
      setShowDetailsDialog(false);
      fetchRequests();

    } catch (err: any) {
      toast.error('Approval failed: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectRequest = async (id: string, name: string) => {
    if (!confirm(`Reject registration request for ${name}?`)) return;
    const { error } = await supabase
      .from('registration_requests')
      .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error('Failed to reject: ' + error.message);
      return;
    }
    toast.success('Request rejected');
    fetchRequests();
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Registration Requests</CardTitle>
            <CardDescription>
              Review and approve new student admission applications.
            </CardDescription>
          </div>
          <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Only</SelectItem>
              <SelectItem value="all">All Requests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-6">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            {filterStatus === 'pending' ? 'No pending requests.' : 'No requests found.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Stream</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(req.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{req.full_name}</TableCell>
                    <TableCell>{req.class_applying}</TableCell>
                    <TableCell>
                      {req.requested_stream ? (
                        <Badge variant="outline">{req.requested_stream}</Badge>
                      ) : SSS_CLASSES.includes(req.class_applying) ? (
                        <span className="text-xs text-muted-foreground">Not specified</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{req.parent_name}</p>
                      <p className="text-xs text-muted-foreground">{req.parent_phone}</p>
                    </TableCell>
                    <TableCell>{statusBadge(req.status)}</TableCell>
                    <TableCell className="text-center">
                      {req.status === 'pending' && (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" onClick={() => openReviewDialog(req)}>
                            Review
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectRequest(req.id, req.full_name)}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Registration Request</DialogTitle>
              <DialogDescription>
                Approve or reject this student admission application.
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Student Name</p>
                    <p className="font-semibold">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-semibold">{selectedRequest.gender || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold">{selectedRequest.date_of_birth || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Class Applying</p>
                    <p className="font-semibold">{selectedRequest.class_applying}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Previous School</p>
                    <p className="font-semibold">{selectedRequest.previous_school || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parent Name</p>
                    <p className="font-semibold">{selectedRequest.parent_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parent Phone</p>
                    <p className="font-semibold">{selectedRequest.parent_phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Parent Email</p>
                    <p className="font-semibold">{selectedRequest.parent_email}</p>
                  </div>
                </div>

                <form onSubmit={handleApproveRequest} className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Approve Admission</h3>
                  <div>
                    <Label>Registration Number</Label>
                    <Input
                      placeholder="e.g. GSS/2026/001"
                      value={approvalForm.registrationNumber}
                      onChange={e => setApprovalForm(f => ({ ...f, registrationNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Assign Class</Label>
                    <Select
                      value={approvalForm.assignedClass}
                      onValueChange={v => setApprovalForm(f => ({
                        ...f,
                        assignedClass: v,
                        assignedStream: SSS_CLASSES.includes(v) ? f.assignedStream : '',
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'Nursery 1', 'Nursery 2',
                          'Primary 1', 'Primary 2', 'Primary 3',
                          'Primary 4', 'Primary 5', 'Primary 6',
                          'JSS 1', 'JSS 2', 'JSS 3',
                          'SSS 1', 'SSS 2', 'SSS 3',
                        ].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {SSS_CLASSES.includes(approvalForm.assignedClass) && (
                    <div>
                      <Label>Stream *</Label>
                      <Select
                        value={approvalForm.assignedStream}
                        onValueChange={v => setApprovalForm(f => ({ ...f, assignedStream: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stream..." />
                        </SelectTrigger>
                        <SelectContent>
                          {STREAMS.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Initial Password</Label>
                    <Input
                      type="password"
                      placeholder="Min 6 characters e.g. Student@123"
                      value={approvalForm.password}
                      onChange={e => setApprovalForm(f => ({ ...f, password: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Student logs in with registration number + this password.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowDetailsDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={approving}>
                      {approving ? 'Creating Account...' : 'Approve & Create Account'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
