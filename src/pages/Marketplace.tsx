"use client";

import { useState } from "react";
import { AdvancedMarketplace } from "@/components/marketplace/AdvancedMarketplace";
import { AdvancedPropertySearch } from "@/components/marketplace/AdvancedPropertySearch";
import { Property, usePropertySearch } from "@/hooks/usePropertySearch";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SidebarIcon, LayoutGridIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const Marketplace = () => {
  const [hideSidebar, setHideSidebar] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (hideSidebar) {
    return <DualSegmentMarketplace onRestoreSidebar={() => setHideSidebar(false)} />;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHideSidebar(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <LayoutGridIcon className="h-4 w-4 mr-2" />
          Dual Layout
        </Button>
      </div>
      <AdvancedMarketplace />
    </div>
  );
};

interface DualSegmentMarketplaceProps {
  onRestoreSidebar: () => void;
}

function DualSegmentMarketplace({ onRestoreSidebar }: DualSegmentMarketplaceProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const {
    properties,
    isLoading,
    totalCount,
    hasMore,
    searchProperties,
    clearResults,
  } = usePropertySearch();

  const handleSearch = async (filters: any) => {
    clearResults();
    await searchProperties({
      ...filters,
      limit: 20,
      offset: 0,
    });
  };

  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <Button variant="outline" size="sm" onClick={onRestoreSidebar}>
            <SidebarIcon className="h-4 w-4 mr-2" />
            Show Sidebar
          </Button>
        </div>
        <AdvancedPropertySearch onSearch={handleSearch} loading={isLoading} />
        <PropertyGrid 
          properties={properties} 
          isLoading={isLoading} 
          totalCount={totalCount}
          hasMore={hasMore}
          onLoadMore={() => searchProperties({ offset: properties.length })}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Marketplace - Dual Layout</h1>
        <Button variant="outline" size="sm" onClick={onRestoreSidebar}>
          <SidebarIcon className="h-4 w-4 mr-2" />
          Restore Sidebar
        </Button>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <div className="h-full p-4 overflow-y-auto bg-muted/20">
            <AdvancedPropertySearch onSearch={handleSearch} loading={isLoading} />
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={70}>
          <div className="h-full p-4 overflow-y-auto">
            <PropertyGrid 
              properties={properties} 
              isLoading={isLoading} 
              totalCount={totalCount}
              hasMore={hasMore}
              onLoadMore={() => searchProperties({ offset: properties.length })}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

interface PropertyGridProps {
  properties: Property[];
  isLoading: boolean;
  totalCount: number;
  hasMore: boolean;
  onLoadMore: () => void;
}

function PropertyGrid({ properties, isLoading, totalCount, hasMore, onLoadMore }: PropertyGridProps) {
  if (properties.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No properties found. Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.length > 0 && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Search Results ({totalCount} properties found)
          </h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load More Properties"}
          </Button>
        </div>
      )}
    </div>
  );
}

// Simplified PropertyCard for the dual layout
function PropertyCard({ property }: { property: Property }) {
  const getPrimaryImage = (property: any) => {
    return (
      property.property_images?.find((img: any) => img.is_primary)?.url ||
      property.property_images?.[0]?.url ||
      "/placeholder.svg"
    );
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: price.currency || "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount / 100);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={getPrimaryImage(property)}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {property.is_featured && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
        <p className="text-muted-foreground text-sm">
          {property.location?.city}, {property.location?.state}
        </p>
        <p className="text-lg font-bold text-green-600">
          {formatPrice(property.price)}
        </p>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;
