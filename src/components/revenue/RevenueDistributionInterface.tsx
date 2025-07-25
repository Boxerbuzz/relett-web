import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useDividendDistribution } from '@/hooks/useDividendDistribution';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, DollarSign, Users, TrendingUp, Clock, Check, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DistributionSchedule {
  id: string;
  tokenized_property_id: string;
  property_name: string;
  amount: number;
  distribution_date: Date;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  recipients_count: number;
  total_distributed?: number;
  tax_withheld?: number;
}

export function RevenueDistributionInterface() {
  const { user } = useAuth();
  const { distributeDividends, getDividendHistory, loading, error } = useDividendDistribution();
  
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [distributionAmount, setDistributionAmount] = useState('');
  const [distributionDate, setDistributionDate] = useState<Date>();
  const [distributionNote, setDistributionNote] = useState('');
  const [schedules, setSchedules] = useState<DistributionSchedule[]>([]);
  const [dividendHistory, setDividendHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('new');

  // Mock data - in real app, fetch from backend
  const properties = [
    { id: '1', name: 'Luxury Apartment Complex', token_holders: 45 },
    { id: '2', name: 'Commercial Office Building', token_holders: 32 },
    { id: '3', name: 'Retail Shopping Center', token_holders: 67 }
  ];

  useEffect(() => {
    // Load dividend history
    if (selectedProperty) {
      getDividendHistory(selectedProperty).then(setDividendHistory);
    }
    
    // Mock scheduled distributions
    setSchedules([
      {
        id: '1',
        tokenized_property_id: '1',
        property_name: 'Luxury Apartment Complex',
        amount: 25000,
        distribution_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'scheduled',
        recipients_count: 45
      },
      {
        id: '2',
        tokenized_property_id: '2',
        property_name: 'Commercial Office Building',
        amount: 18000,
        distribution_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'processing',
        recipients_count: 32,
        total_distributed: 15500,
        tax_withheld: 2500
      }
    ]);
  }, [selectedProperty, getDividendHistory]);

  const handleDistribute = async () => {
    if (!selectedProperty || !distributionAmount) return;

    try {
      const result = await distributeDividends(selectedProperty, parseFloat(distributionAmount));
      console.log('Distribution result:', result);
      
      // Reset form
      setDistributionAmount('');
      setDistributionNote('');
      setActiveTab('history');
    } catch (err) {
      console.error('Distribution failed:', err);
    }
  };

  const calculateTaxWithholding = (amount: number) => {
    return amount * 0.1; // 10% withholding tax
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculateTaxWithholding(amount);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      case 'scheduled':
      default:
        return 'outline';
    }
  };

  const totalScheduledAmount = schedules
    .filter(s => s.status === 'scheduled')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalRecipients = schedules
    .reduce((sum, s) => sum + s.recipients_count, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Distributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalScheduledAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {schedules.filter(s => s.status === 'scheduled').length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecipients}</div>
            <p className="text-xs text-muted-foreground">
              Across {properties.length} properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(43000)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(s => s.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active distributions
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">New Distribution</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Revenue Distribution</CardTitle>
              <CardDescription>
                Distribute revenue to token holders based on their ownership percentage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="property">Select Property</Label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name} ({property.token_holders} holders)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Distribution Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount in USD"
                    value={distributionAmount}
                    onChange={(e) => setDistributionAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Distribution Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !distributionDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {distributionDate ? format(distributionDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={distributionDate}
                        onSelect={setDistributionDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Distribution Note</Label>
                  <Textarea
                    id="note"
                    placeholder="Optional note for recipients"
                    value={distributionNote}
                    onChange={(e) => setDistributionNote(e.target.value)}
                  />
                </div>
              </div>

              {distributionAmount && selectedProperty && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Distribution Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(parseFloat(distributionAmount))}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tax Withholding (10%):</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(calculateTaxWithholding(parseFloat(distributionAmount)))}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net Distribution:</span>
                      <span className="ml-2 font-medium">
                        {formatCurrency(calculateNetAmount(parseFloat(distributionAmount)))}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recipients:</span>
                      <span className="ml-2 font-medium">
                        {properties.find(p => p.id === selectedProperty)?.token_holders || 0} holders
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleDistribute}
                disabled={!selectedProperty || !distributionAmount || loading}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Distribute Revenue'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Distributions</CardTitle>
              <CardDescription>Upcoming revenue distributions</CardDescription>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scheduled distributions
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(schedule.status)}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{schedule.property_name}</p>
                            <Badge variant={getStatusBadgeVariant(schedule.status)}>
                              {schedule.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(schedule.distribution_date)} • {schedule.recipients_count} recipients
                          </p>
                          {schedule.status === 'processing' && schedule.total_distributed && (
                            <div className="flex items-center space-x-2">
                              <Progress 
                                value={(schedule.total_distributed / schedule.amount) * 100} 
                                className="w-24 h-2" 
                              />
                              <span className="text-xs text-muted-foreground">
                                {Math.round((schedule.total_distributed / schedule.amount) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(schedule.amount)}</p>
                        {schedule.tax_withheld && (
                          <p className="text-xs text-muted-foreground">
                            Tax: {formatCurrency(schedule.tax_withheld)}
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

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution History</CardTitle>
              <CardDescription>Past revenue distributions and their details</CardDescription>
            </CardHeader>
            <CardContent>
              {dividendHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No distribution history found
                </div>
              ) : (
                <div className="space-y-4">
                  {dividendHistory.map((distribution) => (
                    <div key={distribution.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">Distribution #{distribution.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(distribution.distribution_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {distribution.dividend_payments?.length || 0} payments processed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(distribution.total_revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(distribution.revenue_per_token)}/token
                        </p>
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