import React from "react";
import { ServiceCategoryCard } from "./ServiceCategoryCard";
import {
  TruckIcon,
  PaletteIcon,
  SparkleIcon,
  LightningIcon,
  EyeIcon,
  WrenchIcon,
} from "@phosphor-icons/react";

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  providerCount: number;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: "movers",
    name: "Movers & Packers",
    description:
      "Professional moving and packing services for your relocation needs",
    icon: TruckIcon,
    providerCount: 45,
  },
  {
    id: "decorators",
    name: "Interior Decorators",
    description:
      "Transform your space with expert interior design and decoration",
    icon: PaletteIcon,
    providerCount: 32,
  },
  {
    id: "cleaners",
    name: "Cleaning Services",
    description:
      "Professional cleaning for homes, offices, and post-construction sites",
    icon: SparkleIcon,
    providerCount: 67,
  },
  {
    id: "electricians",
    name: "Electricians",
    description:
      "Licensed electrical services for installation, repair, and maintenance",
    icon: LightningIcon,
    providerCount: 28,
  },
  {
    id: "surveyors",
    name: "Land Surveyors",
    description:
      "Professional surveying services for property measurement and mapping",
    icon: EyeIcon,
    providerCount: 15,
  },
  {
    id: "maintenance",
    name: "General Maintenance",
    description: "Comprehensive property maintenance and repair services",
    icon: WrenchIcon,
    providerCount: 52,
  },
];

export function ServiceCategories() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {serviceCategories.map((category) => (
        <ServiceCategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
