
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Home,
  Calendar,
  Search
} from 'lucide-react';

interface VerificationTask {
  id: string;
  property_id: string;
  verifier_id: string | null;
  task_type: string;
  status: string;
  priority: string;
  assigned_at: string | null;
  completed_at: string | null;
  deadline: string | null;
  verification_checklist: any;
  verifier_notes: string | null;
  decision: string | null;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
  properties: {
    id: string;
    title: string | null;
    type: string;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
    user_id: string;
    price?: {
      amount: number;
      currency: string;
    };
    users?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

interface VerificationTaskListProps {
  onTaskSelect?: (task: VerificationTask) => void;
  filterStatus?: string;
  showAssignButton?: boolean;
}

export function VerificationTaskList({ 
  onTaskSelect, 
  filterStatus = 'all',
  showAssignButton = false 
}: VerificationTaskListProps) {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterStatus);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigningTask, setAssigningTask] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerificationTasks();
  }, []);

  const fetchVerificationTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_tasks')
        .select(`
          *,
          properties!inner(
            id,
            title,
            type,
            location,
            user_id,
            users:user_id(first_name, last_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data as VerificationTask[] || []);
    } catch (error) {
      console.error('Error fetching verification tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch verification tasks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const assignTaskToSelf = async (taskId: string) => {
    setAssigningTask(taskId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('verification_tasks')
        .update({
          verifier_id: user.id,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: 'Task Assigned',
        description: 'The verification task has been assigned to you.',
      });

      fetchVerificationTasks();
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign task',
        variant: 'destructive'
      });
    } finally {
      setAssigningTask(null);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.properties.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.properties.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.properties.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'assigned': 
      case 'in_progress': return <Eye className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatLocation = (location: any) => {
    if (!location || typeof location !== 'object') return 'Location not specified';
    return location.city || 'Location not specified';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by property, owner, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No verification tasks found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      {task.properties.title || 'Untitled Property'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.properties.users?.first_name} {task.properties.users?.last_name}
                        </span>
                        <span>{task.properties.type}</span>
                        <span>{formatLocation(task.properties.location)}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize">{task.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTaskSelect?.(task)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    {showAssignButton && task.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => assignTaskToSelf(task.id)}
                        disabled={assigningTask === task.id}
                      >
                        {assigningTask === task.id ? 'Assigning...' : 'Assign to Me'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
