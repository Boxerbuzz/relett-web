
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Target, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface InvestmentGroup {
  id: string;
  name: string;
  description?: string;
  status: string;
  current_amount: number;
  target_amount: number;
  minimum_investment: number;
  investor_count: number;
  closes_at?: string;
  created_at: string;
  updated_at: string;
}

interface InvestmentGroupManagerProps {
  onGroupSelect: (groupId: string) => void;
}

export function InvestmentGroupManager({ onGroupSelect }: InvestmentGroupManagerProps) {
  const { user } = useAuth();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['investment-groups', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('investment_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InvestmentGroup[];
    },
    enabled: !!user
  });

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    onGroupSelect(groupId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'forming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Groups</h2>
          <p className="text-gray-600">Join or create investment groups for property investments</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Investment Groups</h3>
            <p className="text-gray-600 mb-4">Create or join an investment group to start collaborating on property investments.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card 
              key={group.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedGroupId === group.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleGroupSelect(group.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <Badge className={getStatusColor(group.status)}>
                    {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                  </Badge>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{((group.current_amount / group.target_amount) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((group.current_amount / group.target_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatCurrency(group.current_amount)}</span>
                    <span>{formatCurrency(group.target_amount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{group.investor_count} investors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span>Min: {formatCurrency(group.minimum_investment)}</span>
                  </div>
                </div>

                {group.closes_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Closes: {new Date(group.closes_at).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedGroupId && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Selected group: <strong>{groups.find(g => g.id === selectedGroupId)?.name}</strong>
          </p>
          <p className="text-xs text-blue-600 mt-1">
            You can now view and create polls for this investment group in the "Polls & Voting" tab.
          </p>
        </div>
      )}
    </div>
  );
}
