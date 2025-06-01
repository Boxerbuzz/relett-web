
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MagnifyingGlass, 
  SlidersHorizontal, 
  TrendUp, 
  MapPin, 
  Calendar,
  Users,
  Shield,
  ArrowUpRight
} from 'phosphor-react';
import { InvestmentService, type InvestmentOpportunity } from '@/lib/investment';

interface MarketplaceFilters {
  search: string;
  location: string;
  priceRange: [number, number];
  riskLevel: string;
  propertyType: string;
  minimumROI: number;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'roi' | 'funding';
}

export function AdvancedMarketplace() {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<InvestmentOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MarketplaceFilters>({
    search: '',
    location: '',
    priceRange: [0, 10000000],
    riskLevel: '',
    propertyType: '',
    minimumROI: 0,
    sortBy: 'newest'
  });

  const investmentService = new InvestmentService();

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [opportunities, filters]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await investmentService.getInvestmentOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...opportunities];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        opp.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(opp => 
        opp.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(opp => 
      opp.totalValue >= filters.priceRange[0] && opp.totalValue <= filters.priceRange[1]
    );

    // Risk level filter
    if (filters.riskLevel) {
      filtered = filtered.filter(opp => opp.riskLevel === filters.riskLevel);
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(opp => opp.propertyType === filters.propertyType);
    }

    // Minimum ROI filter
    if (filters.minimumROI > 0) {
      filtered = filtered.filter(opp => opp.expectedROI >= filters.minimumROI);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.totalValue - b.totalValue;
        case 'price-high':
          return b.totalValue - a.totalValue;
        case 'roi':
          return b.expectedROI - a.expectedROI;
        case 'funding':
          return (b.currentFunding / b.targetFunding) - (a.currentFunding / a.targetFunding);
        default:
          return 0;
      }
    });

    setFilteredOpportunities(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'funding': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Investment Marketplace</h1>
          <p className="text-gray-600">Discover premium tokenized real estate opportunities</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredOpportunities.length} Opportunities
          </Badge>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Quick Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by property name or location..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={filters.sortBy} onValueChange={(value: any) => setFilters({...filters, sortBy: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="roi">Highest ROI</SelectItem>
                  <SelectItem value="funding">Funding Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="Enter location"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type</label>
                  <Select value={filters.propertyType} onValueChange={(value) => setFilters({...filters, propertyType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Risk Level</label>
                  <Select value={filters.riskLevel} onValueChange={(value) => setFilters({...filters, riskLevel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Min ROI (%)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minimumROI || ''}
                    onChange={(e) => setFilters({...filters, minimumROI: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range: {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({...filters, priceRange: [value[0], value[1]]})}
                  max={10000000}
                  min={0}
                  step={100000}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              {opportunity.images.length > 0 ? (
                <img 
                  src={opportunity.images[0]} 
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">No Image</span>
                </div>
              )}
              
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={getStatusColor(opportunity.status)}>
                  {opportunity.status}
                </Badge>
                <Badge className={getRiskColor(opportunity.riskLevel)}>
                  {opportunity.riskLevel} risk
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">{opportunity.title}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-1" />
                  {opportunity.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Value:</span>
                  <p className="font-semibold">{formatCurrency(opportunity.totalValue)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Token Price:</span>
                  <p className="font-semibold">{formatCurrency(opportunity.tokenPrice)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Expected ROI:</span>
                  <div className="flex items-center">
                    <TrendUp size={14} className="mr-1 text-green-600" />
                    <span className="font-semibold text-green-600">{opportunity.expectedROI}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Min Investment:</span>
                  <p className="font-semibold">{formatCurrency(opportunity.minimumInvestment)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Funding Progress:</span>
                  <span>{Math.round((opportunity.currentFunding / opportunity.targetFunding) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(opportunity.currentFunding / opportunity.targetFunding) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(opportunity.currentFunding)} raised</span>
                  <span>{formatCurrency(opportunity.targetFunding)} goal</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Users size={14} className="mr-1" />
                  {opportunity.investorCount} investors
                </div>
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  {opportunity.investmentTerm}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  Invest Now
                </Button>
                <Button variant="outline" size="icon">
                  <ArrowUpRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No investment opportunities match your criteria</p>
          <Button 
            variant="outline" 
            onClick={() => setFilters({
              search: '',
              location: '',
              priceRange: [0, 10000000],
              riskLevel: '',
              propertyType: '',
              minimumROI: 0,
              sortBy: 'newest'
            })}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
