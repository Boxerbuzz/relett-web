import * as React from "react";
import { NavigationArrowIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DirectionsButtonProps {
  // Location can be provided as coordinates or address
  location: {
    coordinates?: {
      lat: number;
      lng: number;
    };
    address?: string;
  };
  // Optional custom text for the button
  children?: React.ReactNode;
  // Button variants from the base Button component
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  // Additional className
  className?: string;
  // Disabled state
  disabled?: boolean;
  // Custom icon
  icon?: React.ReactNode;
  // Force specific map app (optional)
  preferredMap?: "google" | "apple";
}

export function DirectionsButton({
  location,
  children = "Get Directions",
  variant = "default",
  size = "default",
  className,
  disabled = false,
  icon,
  preferredMap,
}: DirectionsButtonProps) {
  const handleDirections = () => {
    if (!location.coordinates && !location.address) {
      console.error("No location provided for directions");
      return;
    }

    // Determine the user's device and preferred map app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let mapApp = preferredMap;

    // Auto-detect if no preference specified
    if (!mapApp) {
      if (isIOS) {
        mapApp = "apple";
      } else {
        mapApp = "google";
      }
    }

    // Build the URL based on the map app and location type
    let url: string;

    if (location.coordinates) {
      const { lat, lng } = location.coordinates;

      if (mapApp === "apple") {
        // Apple Maps with coordinates
        url = `https://maps.apple.com/?daddr=${lat},${lng}`;
      } else {
        // Google Maps with coordinates
        url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      }
    } else if (location.address) {
      const encodedAddress = encodeURIComponent(location.address);

      if (mapApp === "apple") {
        // Apple Maps with address
        url = `https://maps.apple.com/?daddr=${encodedAddress}`;
      } else {
        // Google Maps with address
        url = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      }
    } else {
      console.error("No valid location provided");
      return;
    }

    // Open the map app
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open directions:", error);

      // Fallback: try to open in the same window
      try {
        window.location.href = url;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  };

  // Default icon if none provided
  const defaultIcon = icon || <NavigationArrowIcon className="h-4 w-4" />;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleDirections}
      disabled={disabled || (!location.coordinates && !location.address)}
    >
      {defaultIcon}
      {children}
    </Button>
  );
}

// Export a simpler version for just coordinates
export function CoordinatesDirectionsButton({
  lat,
  lng,
  children = "Get Directions",
  ...props
}: {
  lat: number;
  lng: number;
  children?: React.ReactNode;
} & Omit<DirectionsButtonProps, "location">) {
  return (
    <DirectionsButton
      location={{ coordinates: { lat, lng } }}
      children={children}
      {...props}
    />
  );
}

// Export a simpler version for just address
export function AddressDirectionsButton({
  address,
  children = "Get Directions",
  ...props
}: {
  address: string;
  children?: React.ReactNode;
} & Omit<DirectionsButtonProps, "location">) {
  return (
    <DirectionsButton location={{ address }} children={children} {...props} />
  );
}
