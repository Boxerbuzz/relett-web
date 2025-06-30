
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Heart, Star, TrendingUp } from 'lucide-react';

interface PropertyAnalyticsProps {
  propertyId: string;
}

interface AnalyticsData {
  totalViews: number;
  uniqueViews: number;
  totalLikes: number;
  totalFavorites: number;
  averageViewDuration: number;
  topReferrers: string[];
  deviceBreakdown: { desktop: number; mobile: number };
}

export function PropertyAnalytics({ propertyId }: PropertyAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get property views
        const { data: views } = await supabase
          .from('property_views')
          .select('*')
          .eq('property_id', propertyId);

        // Get property likes
        const { data: likes } = await supabase
          .from('property_likes')
          .select('*')
          .eq('property_id', propertyId);

        // Get property favorites
        const { data: favorites } = await supabase
          .from('property_favorites')
          .select('*')
          .eq('property_id', propertyId);

        if (views) {
          const uniqueUsers = new Set(views.map(v => v.user_id)).size;
          const avgDuration = views.reduce((acc, v) => acc + (v.view_duration || 0), 0) / views.length;
          const referrers = [...new Set(views.map(v => v.referrer).filter(Boolean))];
          
          const deviceCounts = views.reduce((acc, v) => {
            const isMobile = /Mobile|Android|iPhone|iPad/.test(v.device_type || '');
            acc[isMobile ? 'mobile' : 'desktop']++;
            return acc;
          }, { desktop: 0, mobile: 0 });

          setAnalytics({
            totalViews: views.length,
            uniqueViews: uniqueUsers,
            totalLikes: likes?.length || 0,
            totalFavorites: favorites?.length || 0,
            averageViewDuration: Math.round(avgDuration),
            topReferrers: referrers.slice(0, 3),
            deviceBreakdown: deviceCounts
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [propertyId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Property Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Property Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-2xl font-bold">{analytics.totalViews}</span>
            </div>
            <p className="text-xs text-gray-600">Total Views</p>
            <p className="text-xs text-gray-500">{analytics.uniqueViews} unique</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Heart className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-2xl font-bold">{analytics.totalLikes}</span>
            </div>
            <p className="text-xs text-gray-600">Likes</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-2xl font-bold">{analytics.totalFavorites}</span>
            </div>
            <p className="text-xs text-gray-600">Favorites</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl font-bold">{analytics.averageViewDuration}s</span>
            </div>
            <p className="text-xs text-gray-600">Avg. View Time</p>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Device Usage</h4>
          <div className="flex gap-2">
            <Badge variant="outline">
              Desktop: {analytics.deviceBreakdown.desktop}
            </Badge>
            <Badge variant="outline">
              Mobile: {analytics.deviceBreakdown.mobile}
            </Badge>
          </div>
        </div>

        {/* Top Referrers */}
        {analytics.topReferrers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Top Referrers</h4>
            <div className="space-y-1">
              {analytics.topReferrers.map((referrer, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {new URL(referrer).hostname}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
