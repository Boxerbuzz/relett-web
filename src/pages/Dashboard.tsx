
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { PropertyCard } from '@/components/marketplace/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Bell, Home, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface PropertyWithTokenization {
  id: string;
  title: string;
  location: any;
  price: any;
  views: number;
  is_verified: boolean;
  is_tokenized: boolean;
  backdrop?: string;
  tokenized_properties?: {
    token_price: number;
    total_supply: string;
    expected_roi: number;
    token_holdings: any[];
  };
  property_images?: Array<{
    url: string;
    is_primary: boolean;
  }>;
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [featuredProperties, setFeaturedProperties] = useState<PropertyWithTokenization[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'properties') {
      fetchFeaturedProperties();
    }
  }, [activeTab]);

  const fetchFeaturedProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          price,
          views,
          is_verified,
          is_tokenized,
          backdrop,
          tokenized_properties!tokenized_properties_property_id_fkey(
            token_price,
            total_supply,
            expected_roi,
            token_holdings(id)
          )
        `)
        .eq('status', 'active')
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Fetch property images separately to avoid join issues
      const propertiesWithImages = await Promise.all(
        (data || []).map(async (property) => {
          const { data: images } = await supabase
            .from('property_images')
            .select('url, is_primary')
            .eq('property_id', property.id)
            .order('sort_order', { ascending: true });

          return {
            ...property,
            property_images: images || []
          };
        })
      );

      setFeaturedProperties(propertiesWithImages);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (propertyId: string) => {
    console.log('View details for property:', propertyId);
    // Navigate to property details page
  };

  const handleInvest = (propertyId: string) => {
    console.log('Invest in property:', propertyId);
    // Open investment dialog
  };

  const getPropertyImage = (property: PropertyWithTokenization) => {
    const primaryImage = property.property_images?.find(img => img.is_primary);
    return primaryImage?.url || property.backdrop || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop';
  };

  const getTokenizationData = (property: PropertyWithTokenization) => {
    if (!property.is_tokenized || !property.tokenized_properties) {
      return null;
    }

    const tokenData = property.tokenized_properties;
    const totalSupply = parseInt(tokenData.total_supply);
    const soldTokens = tokenData.token_holdings?.length || 0;
    const availableTokens = totalSupply - soldTokens;
    const investorCount = tokenData.token_holdings?.length || 0;

    return {
      tokenPrice: tokenData.token_price,
      totalTokens: totalSupply,
      availableTokens,
      expectedROI: tokenData.expected_roi,
      investorCount
    };
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your investment overview</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Live Data
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Explore
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Dashboard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions />
            <NotificationsList />
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <MarketOverview />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsList />
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Investment Opportunities</CardTitle>
              <CardDescription>
                Discover verified properties available for tokenized investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No properties available at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProperties.map((property) => {
                    const tokenData = getTokenizationData(property);
                    
                    return (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        title={property.title}
                        location={property.location}
                        price={property.price}
                        tokenPrice={tokenData?.tokenPrice}
                        totalTokens={tokenData?.totalTokens}
                        availableTokens={tokenData?.availableTokens}
                        expectedROI={tokenData?.expectedROI}
                        investorCount={tokenData?.investorCount}
                        imageUrl={getPropertyImage(property)}
                        isVerified={property.is_verified}
                        views={property.views || 0}
                        isTokenized={property.is_tokenized}
                        onViewDetails={handleViewDetails}
                        onInvest={property.is_tokenized ? handleInvest : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
