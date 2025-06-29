import { EnhancedPropertyCard } from "./EnhancedPropertyCard";

// Keep the existing interface for backward compatibility
interface PropertyCardProps {
  property: {
    id: string;
    title?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
    };
    price?: {
      amount?: number;
      currency?: string;
    };
    category?: string;
    type?: string;
    views?: number;
    likes?: number;
    ratings?: number;
    backdrop?: string;
    is_featured?: boolean;
    created_at?: string;
  };
  onViewDetails?: (propertyId: string) => void;
  onToggleFavorite?: (propertyId: string) => void;
  className?: string;
}

export function PropertyCard(props: PropertyCardProps) {
  // Transform the property data to match the enhanced card's interface
  const enhancedProperty = {
    ...props.property,
    price: props.property.price ? {
      ...props.property.price,
      period: props.property.type === 'rent' ? 'month' : 
              props.property.type === 'shortlet' ? 'night' : undefined
    } : props.property.price,
  };

  return <EnhancedPropertyCard {...props} property={enhancedProperty} />;
}
