
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Check, X, Clock, Eye, Search, Users, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles } from '@/hooks/useUserRoles';
import { VerificationTaskManager } from './VerificationTaskManager';
import { DocumentViewer } from './DocumentViewer';

interface VerificationStats {
  totalTasks: number;
  pendingTasks: number;
  assignedTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
}

interface VerificationRequest {
  id: string;
  document_id: string;
  requested_by: string;
  assigned_verifier: string | null;
  status: string;
  priority: string;
  created_at: string;
  property_documents: {
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    mime_type: string;
    file_size: number;
    property_id: string | null;
    land_title_id: string | null;
  };
  requester?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function VerificationReviewDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [stats, setStats] = useState<VerificationStats>({
    totalTasks: 0,
    pendingTasks: 0,
    assignedTasks: 0,
    completedTasks: 0,
    averageCompletionTime: 0
  });
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const { hasRole } = useUserRoles();
  const { toast } = useToast();

  const isVerifier = hasRole('verifier') || hasRole('admin');

  useEffect(() => {
    if (isVerifier) {
      fetchVerificationStats();
      fetchVerificationRequests();
    }
  }, [isVerifier]);

  const fetchVerificationStats = async () => {
    try {
      // Fetch verification tasks stats
      const { data: tasksData, error: tasksError } = await supabase
        .from('verification_tasks')
        .select('status, created_at, completed_at');

      if (tasksError) throw tasksError;

      const tasks = tasksData || [];
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      const assignedTasks = tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;

      // Calculate average completion time
      const completedTasksWithTimes = tasks.filter(t => 
        t.status === 'completed' && t.completed_at && t.created_at
      );
      
      let averageCompletionTime = 0;
      if (completedTasksWithTimes.length > 0) {
        const totalTime = completedTasksWithTimes.reduce((sum, task) => {
          const created = new Date(task.created_at).getTime();
          const completed = new Date(task.completed_at!).getTime();
          return sum + (completed - created);
        }, 0);
        averageCompletionTime = totalTime / completedTasksWithTimes.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      setStats({
        totalTasks,
        pendingTasks,
        assignedTasks,
        completedTasks,
        averageCompletionTime
      });
    } catch (error) {
      console.error('Error fetching verification stats:', error);
    }
  };

  const fetchVerificationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('document_verification_requests')
        .select(`
          *,
          property_documents!inner(*),
          users!requested_by(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = (data || []).map(item => ({
        ...item,
        requester: Array.isArray(item.users) ? item.users[0] : item.users
      }));

      setRequests(processedData as VerificationRequest[] || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification requests.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      request.property_documents.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isVerifier) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Verifier Access Required</h3>
          <p className="text-gray-600">
            You need verifier permissions to access the verification dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showDocumentViewer && selectedRequest) {
    return (
      <DocumentViewer
        documentUrl={selectedRequest.property_documents.file_url}
        documentName={selectedRequest.property_documents.document_name}
        mimeType={selectedRequest.property_documents.mime_type}
        onClose={() => setShowDocumentViewer(false)}
        onAnnotate={(annotations) => console.log('Annotations:', annotations)}
        isVerificationMode={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Verification Dashboard</h1>
          <p className="text-muted-foreground">Manage property and document verification processes</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          {stats.totalTasks} total tasks
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">All verification tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assignedTasks}</div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.averageCompletionTime.toFixed(1)}d
            </div>
            <p className="text-xs text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Property Verification Tasks</TabsTrigger>
          <TabsTrigger value="documents">Document Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <VerificationTaskManager />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {/* Document Verification Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by document name or requester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Document Verification Requests */}
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No document verification requests found.</p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {request.property_documents.document_name}
                        </CardTitle>
                        <CardDescription>
                          Requested by: {request.requester?.first_name} {request.requester?.last_name}
                        </CardDescription>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Type: {request.property_documents.document_type}</span>
                          <span>•</span>
                          <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDocumentViewer(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
