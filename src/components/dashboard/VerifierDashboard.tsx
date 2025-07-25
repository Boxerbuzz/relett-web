
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from './StatsCard';
import { 
  FileText, 
  Shield, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';

export function VerifierDashboard() {
  const stats = [
    {
      title: 'Pending Reviews',
      value: '8',
      icon: <FileText className="h-4 w-4" />,
      description: 'Awaiting verification'
    },
    {
      title: 'Completed Reviews',
      value: '24',
      icon: <Shield className="h-4 w-4" />,
      description: 'This month',
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Average Review Time',
      value: '2.3 days',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Industry leading'
    },
    {
      title: 'Monthly Earnings',
      value: '$4,200',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'From verification fees',
      trend: { value: 8, isPositive: true }
    }
  ];

  const verificationQueue = [
    {
      id: '1',
      propertyTitle: 'Commercial Plot - Victoria Island',
      requester: 'John Doe',
      priority: 'high',
      submittedAt: '2 hours ago',
      estimatedValue: '$850,000',
      documentCount: 12
    },
    {
      id: '2',
      propertyTitle: 'Residential Land - Lekki',
      requester: 'Jane Smith',
      priority: 'medium',
      submittedAt: '1 day ago',
      estimatedValue: '$1,200,000',
      documentCount: 8
    },
    {
      id: '3',
      propertyTitle: 'Mixed-Use Plot - Ikoyi',
      requester: 'Mike Johnson',
      priority: 'low',
      submittedAt: '3 days ago',
      estimatedValue: '$420,000',
      documentCount: 6
    }
  ];

  const recentCompletions = [
    {
      id: '1',
      propertyTitle: 'Industrial Land - Agbara',
      status: 'approved',
      completedAt: '2 hours ago',
      fee: '$150'
    },
    {
      id: '2',
      propertyTitle: 'Residential Plot - Ajah',
      status: 'rejected',
      completedAt: '5 hours ago',
      fee: '$100'
    },
    {
      id: '3',
      propertyTitle: 'Commercial Building - VI',
      status: 'approved',
      completedAt: '1 day ago',
      fee: '$200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
          <CardDescription>Manage your verification tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">8</span> pending reviews
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">$1,200</span> potential earnings
              </div>
            </div>
            <Button size="sm">
              <Clock className="h-4 w-4 mr-1" />
              Start Review
            </Button>
          </div>
          <Progress value={70} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">Daily target: 70% complete</p>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Properties awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationQueue.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{item.propertyTitle}</h3>
                    <Badge 
                      variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                    >
                      {item.priority}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Requester: {item.requester}</p>
                    <p>Value: {item.estimatedValue}</p>
                    <p>Documents: {item.documentCount}</p>
                    <p>Submitted: {item.submittedAt}</p>
                  </div>
                  <Button size="sm" className="mt-3 w-full">
                    Start Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Completions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Completions</CardTitle>
            <CardDescription>Your latest verification results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompletions.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.propertyTitle}</h4>
                    <p className="text-xs text-gray-600">{item.completedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'approved' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{item.fee}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reputation Score</CardTitle>
            <CardDescription>Based on accuracy and speed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-bold text-lg">4.9</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Excellent performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy Rate</CardTitle>
            <CardDescription>Verification accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold">96.5%</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Excellent
                </Badge>
              </div>
              <Progress value={96.5} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average review time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold">2.3</span>
                <span className="text-gray-600">days</span>
              </div>
              <p className="text-sm text-green-600">15% faster than average</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
