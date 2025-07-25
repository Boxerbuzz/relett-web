import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, Clock, Search, FileText, Users, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ComplianceCheck {
  id: string;
  user_id: string;
  check_type: string;
  status: 'pending' | 'passed' | 'failed' | 'requires_review';
  risk_level?: string | null;
  risk_score?: number | null;
  created_at: string;
  updated_at: string;
  alerts: any[];
  review_notes?: string | null;
}

interface AuditTrail {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  created_at: string;
  flagged: boolean;
  risk_score?: number | null;
  flag_reason?: string | null;
}

interface KYCValidation {
  id: string;
  user_id: string;
  document_type: string;
  validation_status: 'pending' | 'verified' | 'rejected';
  verification_score: number;
  created_at: string;
}

export function ComplianceIntegration() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [kycValidations, setKycValidations] = useState<KYCValidation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch compliance data
  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    setLoading(true);
    try {
      // Fetch AML checks
      const { data: amlData, error: amlError } = await supabase
        .from('aml_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (amlError) throw amlError;

      const formattedChecks: ComplianceCheck[] = (amlData || []).map(check => ({
        id: check.id,
        user_id: check.user_id,
        check_type: check.check_type,
        status: check.status as 'pending' | 'passed' | 'failed' | 'requires_review',
        risk_level: check.risk_level,
        risk_score: check.risk_score,
        created_at: check.created_at,
        updated_at: check.created_at,
        alerts: Array.isArray(check.alerts) ? check.alerts : [],
        review_notes: check.review_notes
      }));

      setComplianceChecks(formattedChecks);

      // Fetch audit trails
      const { data: auditData, error: auditError } = await supabase
        .from('audit_trails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      const formattedAudit: AuditTrail[] = (auditData || []).map(audit => ({
        id: audit.id,
        user_id: audit.user_id || '',
        action: audit.action,
        resource_type: audit.resource_type,
        resource_id: audit.resource_id || '',
        created_at: audit.created_at,
        flagged: audit.flagged,
        risk_score: audit.risk_score,
        flag_reason: audit.flag_reason
      }));

      setAuditTrails(formattedAudit);

      // Mock KYC validations
      setKycValidations([
        {
          id: '1',
          user_id: 'user-123',
          document_type: 'passport',
          validation_status: 'verified',
          verification_score: 95,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user-456',
          document_type: 'drivers_license',
          validation_status: 'pending',
          verification_score: 78,
          created_at: new Date().toISOString()
        }
      ]);

    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch compliance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runKYCCheck = async (userId: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would call an external KYC service
      const mockResult = {
        status: Math.random() > 0.3 ? 'passed' : 'failed',
        risk_score: Math.floor(Math.random() * 100),
        risk_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      };

      const { error } = await supabase
        .from('aml_checks')
        .insert({
          user_id: userId,
          check_type: 'kyc_verification',
          status: mockResult.status,
          risk_score: mockResult.risk_score,
          risk_level: mockResult.risk_level,
          provider: 'mock_service',
          request_payload: { user_id: userId },
          response_payload: mockResult
        });

      if (error) throw error;

      toast({
        title: 'KYC Check Initiated',
        description: `Check status: ${mockResult.status}`,
        variant: mockResult.status === 'passed' ? 'default' : 'destructive'
      });

      fetchComplianceData();

    } catch (error) {
      console.error('Error running KYC check:', error);
      toast({
        title: 'Error',
        description: 'Failed to run KYC check',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateTransfer = async (fromUserId: string, toUserId: string, amount: number) => {
    setLoading(true);
    try {
      // Simulate transfer validation logic
      const fromUserCompliance = complianceChecks.find(
        check => check.user_id === fromUserId && check.status === 'passed'
      );
      const toUserCompliance = complianceChecks.find(
        check => check.user_id === toUserId && check.status === 'passed'
      );

      if (!fromUserCompliance || !toUserCompliance) {
        throw new Error('One or both users have not passed compliance checks');
      }

      // Check transaction limits
      if (amount > 50000) {
        throw new Error('Transaction amount exceeds daily limit');
      }

      // Log audit trail
      const { error } = await supabase
        .from('audit_trails')
        .insert({
          user_id: fromUserId,
          action: 'transfer_validation',
          resource_type: 'token_transfer',
          resource_id: `${fromUserId}-${toUserId}`,
          new_values: { amount, to_user: toUserId, validated: true },
          flagged: false
        });

      if (error) throw error;

      toast({
        title: 'Transfer Validated',
        description: 'Transaction has passed compliance checks',
        variant: 'default'
      });

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transfer validation failed';
      
      // Log failed validation
      await supabase
        .from('audit_trails')
        .insert({
          user_id: fromUserId,
          action: 'transfer_validation_failed',
          resource_type: 'token_transfer',
          resource_id: `${fromUserId}-${toUserId}`,
          new_values: { amount, to_user: toUserId, error: errorMessage },
          flagged: true,
          flag_reason: errorMessage
        });

      toast({
        title: 'Transfer Blocked',
        description: errorMessage,
        variant: 'destructive'
      });

      return false;
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
      case 'requires_review':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'passed':
      case 'verified':
        return 'default';
      case 'failed':
      case 'rejected':
        return 'destructive';
      case 'pending':
      case 'requires_review':
      default:
        return 'secondary';
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredChecks = complianceChecks.filter(check =>
    check.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    check.check_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAudit = auditTrails.filter(audit =>
    audit.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audit.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    audit.resource_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const passedChecks = complianceChecks.filter(check => check.status === 'passed').length;
  const failedChecks = complianceChecks.filter(check => check.status === 'failed').length;
  const pendingChecks = complianceChecks.filter(check => check.status === 'pending').length;
  const flaggedActivities = auditTrails.filter(audit => audit.flagged).length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Checks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passedChecks}</div>
            <p className="text-xs text-muted-foreground">
              Compliant users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Checks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedChecks}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingChecks}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Activities</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedActivities}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Tools</CardTitle>
          <CardDescription>Run checks and validate transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Users/Activities</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by user ID, action, or resource..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={() => fetchComplianceData()} disabled={loading}>
                Refresh Data
              </Button>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="userId">User ID for KYC Check</Label>
              <Input
                id="userId"
                placeholder="Enter user ID"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => runKYCCheck(selectedUserId)}
                disabled={!selectedUserId || loading}
              >
                Run KYC Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="checks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checks">Compliance Checks</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="kyc">KYC Validations</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AML/Compliance Checks</CardTitle>
              <CardDescription>Review user compliance status and risk assessments</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredChecks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No compliance checks found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredChecks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(check.status)}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">User: {check.user_id.slice(0, 8)}...</p>
                            <Badge variant={getStatusBadgeVariant(check.status)}>
                              {check.status}
                            </Badge>
                            {check.risk_level && (
                              <Badge variant="outline" className={getRiskLevelColor(check.risk_level)}>
                                {check.risk_level} risk
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {check.check_type} • {formatDate(check.created_at)}
                          </p>
                          {check.alerts.length > 0 && (
                            <p className="text-xs text-red-500">
                              {check.alerts.length} alert(s) detected
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {check.risk_score && (
                          <p className="text-sm font-medium">
                            Risk Score: {check.risk_score}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Track all user activities and flagged events</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAudit.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No audit records found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAudit.slice(0, 20).map((audit) => (
                    <div key={audit.id} className={cn(
                      "flex items-center justify-between p-4 border rounded-lg",
                      audit.flagged && "border-red-200 bg-red-50"
                    )}>
                      <div className="flex items-center space-x-3">
                        <Activity className={cn(
                          "h-4 w-4",
                          audit.flagged ? "text-red-500" : "text-blue-500"
                        )} />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{audit.action}</p>
                            {audit.flagged && (
                              <Badge variant="destructive">Flagged</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {audit.resource_type} • User: {audit.user_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(audit.created_at)}
                          </p>
                          {audit.flag_reason && (
                            <p className="text-xs text-red-500">
                              Reason: {audit.flag_reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {audit.risk_score && (
                          <p className="text-sm">Risk: {audit.risk_score}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KYC Validations</CardTitle>
              <CardDescription>Identity verification status and scores</CardDescription>
            </CardHeader>
            <CardContent>
              {kycValidations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No KYC validations found
                </div>
              ) : (
                <div className="space-y-4">
                  {kycValidations.map((validation) => (
                    <div key={validation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(validation.validation_status)}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">User: {validation.user_id}</p>
                            <Badge variant={getStatusBadgeVariant(validation.validation_status)}>
                              {validation.validation_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {validation.document_type} • {formatDate(validation.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Score: {validation.verification_score}%
                        </p>
                        <Progress 
                          value={validation.verification_score} 
                          className="w-16 h-2 mt-1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}