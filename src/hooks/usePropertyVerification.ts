
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationTaskData {
  id: string;
  property_id: string;
  verifier_id: string;
  task_type: string;
  priority: string;
  status: string;
  assigned_at: string;
  deadline: string;
  verification_checklist: any;
  property_title: string;
  property_location: any;
  property_price: any;
  property_category: string;
  property_type: string;
  property_owner: string;
  owner_email: string;
  title_number?: string;
  area_sqm?: number;
  land_use?: string;
  total_documents: number;
  property_image?: string;
  documents: Array<{
    id: string;
    document_type: string;
    document_name: string;
    file_url: string;
    status: string;
    verification_notes?: string;
    verified_at?: string;
    verified_by?: string;
  }>;
  verification_history: Array<{
    id: string;
    action: string;
    previous_status?: string;
    new_status: string;
    notes?: string;
    created_at: string;
    verifier_name: string;
  }>;
  compliance_records: Array<{
    id: string;
    compliance_type: string;
    authority: string;
    reference_number: string;
    issue_date: string;
    expiry_date?: string;
    status: string;
    computed_status: string;
    document_url?: string;
  }>;
}

export function usePropertyVerification() {
  const { user } = useAuth();
  const [verificationTasks, setVerificationTasks] = useState<VerificationTaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVerificationTasks();
    }
  }, [user]);

  const fetchVerificationTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user has verifier role or admin access
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      const hasVerifierAccess = userRoles?.some(role => 
        ['verifier', 'admin'].includes(role.role)
      );

      if (!hasVerifierAccess) {
        setVerificationTasks([]);
        setLoading(false);
        return;
      }

      // Fetch verification tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('verification_tasks')
        .select(`
          *,
          properties!verification_tasks_property_id_fkey (
            id,
            title,
            location,
            price,
            category,
            type,
            user_id,
            land_title_id
          )
        `)
        .eq('verifier_id', user?.id)
        .in('status', ['assigned', 'in_progress'])
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      if (!tasksData || tasksData.length === 0) {
        setVerificationTasks([]);
        setLoading(false);
        return;
      }

      // Get property owners info
      const ownerIds = tasksData.map(task => task.properties?.user_id).filter(Boolean);
      const { data: ownersData } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', ownerIds);

      // Get land titles info
      const landTitleIds = tasksData.map(task => task.properties?.land_title_id).filter(Boolean);
      const { data: landTitlesData } = await supabase
        .from('land_titles')
        .select('id, title_number, area_sqm, land_use')
        .in('id', landTitleIds);

      // Get property images
      const propertyIds = tasksData.map(task => task.property_id);
      const { data: imagesData } = await supabase
        .from('property_images')
        .select('property_id, url')
        .in('property_id', propertyIds)
        .eq('is_primary', true);

      // Get document counts
      const { data: documentCounts } = await supabase
        .from('property_documents')
        .select('property_id')
        .in('property_id', propertyIds)
        .neq('status', 'rejected');

      // Get detailed documents for each property
      const { data: documentsData } = await supabase
        .from('property_documents')
        .select(`
          *,
          document_verification_requests!document_verification_requests_document_id_fkey (
            verification_checklist,
            notes
          )
        `)
        .in('property_id', propertyIds)
        .order('document_type', { ascending: true })
        .order('created_at', { ascending: false });

      // Get verification history
      const taskIds = tasksData.map(task => task.id);
      const { data: historyData } = await supabase
        .from('verification_history')
        .select(`
          *,
          users!verification_history_verifier_id_fkey (
            first_name,
            last_name
          )
        `)
        .in('verification_task_id', taskIds)
        .order('created_at', { ascending: false });

      // Get compliance records
      const { data: complianceData } = await supabase
        .from('compliance_records')
        .select('*')
        .in('land_title_id', landTitleIds);

      // Create lookup maps
      const ownersByProperty = ownersData?.reduce((acc, owner) => {
        acc[owner.id] = owner;
        return acc;
      }, {} as Record<string, any>) || {};

      const landTitlesByProperty = landTitlesData?.reduce((acc, title) => {
        acc[title.id] = title;
        return acc;
      }, {} as Record<string, any>) || {};

      const imagesByProperty = imagesData?.reduce((acc, img) => {
        acc[img.property_id] = img.url;
        return acc;
      }, {} as Record<string, string>) || {};

      const documentCountsByProperty = documentCounts?.reduce((acc, doc) => {
        acc[doc.property_id] = (acc[doc.property_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const documentsByProperty = documentsData?.reduce((acc, doc) => {
        if (!acc[doc.property_id]) acc[doc.property_id] = [];
        acc[doc.property_id].push({
          ...doc,
          verification_notes: doc.document_verification_requests?.[0]?.notes,
        });
        return acc;
      }, {} as Record<string, any[]>) || {};

      const historyByTask = historyData?.reduce((acc, history) => {
        if (!acc[history.verification_task_id]) acc[history.verification_task_id] = [];
        acc[history.verification_task_id].push({
          ...history,
          verifier_name: `${history.users?.first_name} ${history.users?.last_name}`,
        });
        return acc;
      }, {} as Record<string, any[]>) || {};

      const complianceByLandTitle = complianceData?.reduce((acc, compliance) => {
        if (!acc[compliance.land_title_id]) acc[compliance.land_title_id] = [];
        
        // Calculate computed status based on valid compliance status values
        let computed_status = compliance.status;
        if (compliance.expiry_date) {
          const expiryDate = new Date(compliance.expiry_date);
          const now = new Date();
          
          if (expiryDate < now) {
            computed_status = 'expired';
          }
        }
        
        acc[compliance.land_title_id].push({
          ...compliance,
          computed_status
        });
        return acc;
      }, {} as Record<string, any[]>) || {};

      // Combine all data
      const enrichedTasks: VerificationTaskData[] = tasksData.map(task => {
        const property = task.properties;
        const owner = ownersByProperty[property?.user_id];
        const landTitle = landTitlesByProperty[property?.land_title_id];

        return {
          ...task,
          property_title: property?.title || 'Unknown Property',
          property_location: property?.location,
          property_price: property?.price,
          property_category: property?.category,
          property_type: property?.type,
          property_owner: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown Owner',
          owner_email: owner?.email,
          title_number: landTitle?.title_number,
          area_sqm: landTitle?.area_sqm,
          land_use: landTitle?.land_use,
          total_documents: documentCountsByProperty[task.property_id] || 0,
          property_image: imagesByProperty[task.property_id],
          documents: documentsByProperty[task.property_id] || [],
          verification_history: historyByTask[task.id] || [],
          compliance_records: complianceByLandTitle[property?.land_title_id] || []
        };
      });

      setVerificationTasks(enrichedTasks);
    } catch (err) {
      console.error('Error fetching verification tasks:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch verification tasks';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const completeVerificationTask = async (
    taskId: string,
    decision: string,
    decisionReason?: string,
    verifierNotes?: string,
    checklist?: any
  ) => {
    try {
      const { error } = await supabase.rpc('complete_verification_task', {
        p_task_id: taskId,
        p_decision: decision,
        p_decision_reason: decisionReason,
        p_verifier_notes: verifierNotes,
        p_checklist: checklist || {}
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Verification task completed successfully',
      });

      // Refresh the data
      await fetchVerificationTasks();
      
      return { success: true };
    } catch (err) {
      console.error('Error completing verification task:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete verification task';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return { success: false, error: errorMessage };
    }
  };

  return {
    verificationTasks,
    loading,
    error,
    refetch: fetchVerificationTasks,
    completeVerificationTask
  };
}
