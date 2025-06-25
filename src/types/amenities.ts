export interface PropertyAmenity {
  id: string;
  name: string;
  category: string;
  icon: string;
}

const amentiies = [
  // Amenities
  {
    id: "0",
    name: "Swimming pool",
    category: "Amenities",
    icon: "swimming-pool",
  },
  { id: "1", name: "Gym", category: "Amenities", icon: "gym" },
  { id: "2", name: "Parking", category: "Amenities", icon: "parking" },
  { id: "3", name: "Pet-friendly", category: "Amenities", icon: "grid" },
  { id: "4", name: "Workspace", category: "Amenities", icon: "grid" },
  { id: "5", name: "Restaurant", category: "Amenities", icon: "cutlery" },
  { id: "6", name: "Bar", category: "Amenities", icon: "grid" },
  { id: "7", name: "Receptionist", category: "Amenities", icon: "reception" },
  { id: "8", name: "Elevator", category: "Amenities", icon: "lift" },

  // Utilities
  { id: "9", name: "Electricity", category: "Utilities", icon: "grid" },
  { id: "10", name: "Water", category: "Utilities", icon: "grid" },
  { id: "11", name: "Internet Wifi", category: "Utilities", icon: "grid" },
  { id: "12", name: "Cable TV", category: "Utilities", icon: "grid" },
  {
    id: "13",
    name: "Inverter/Solar power",
    category: "Utilities",
    icon: "grid",
  },
  { id: "14", name: "Air Condition", category: "Utilities", icon: "grid" },
  { id: "57", name: "Air filter", category: "Utilities", icon: "grid" },
  { id: "58", name: "Power generator", category: "Utilities", icon: "grid" },

  // Entertainment
  { id: "15", name: "Cinema", category: "Entertainment", icon: "grid" },
  { id: "16", name: "PS4", category: "Entertainment", icon: "grid" },
  { id: "17", name: "Xbox", category: "Entertainment", icon: "grid" },
  {
    id: "18",
    name: "Basketball court",
    category: "Entertainment",
    icon: "grid",
  },
  { id: "32", name: "Football court", category: "Entertainment", icon: "grid" },
  { id: "45", name: "Library", category: "Entertainment", icon: "grid" },
  { id: "46", name: "Pool", category: "Entertainment", icon: "grid" },

  // Bedroom
  { id: "19", name: "Single bed", category: "Bedroom", icon: "grid" },
  { id: "20", name: "Double bed", category: "Bedroom", icon: "grid" },
  { id: "21", name: "Wardrobe", category: "Bedroom", icon: "grid" },
  { id: "22", name: "Bedside drawer", category: "Bedroom", icon: "grid" },
  { id: "23", name: "Dressing Mirror", category: "Bedroom", icon: "grid" },
  { id: "24", name: "Mini fridge", category: "Bedroom", icon: "grid" },
  { id: "31", name: "Bed sheets", category: "Bedroom", icon: "grid" },
  { id: "56", name: "Bedside lamp", category: "Bedroom", icon: "grid" },

  // Kitchen & kitchenette
  {
    id: "25",
    name: "Gas cooker",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "26",
    name: "Microwave",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "27",
    name: "Refrigerator",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "28",
    name: "Dishwasher",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "29",
    name: "Washing machine",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "30",
    name: "Water heater",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "33",
    name: "Toaster",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "34",
    name: "Kitchen cabinets",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },
  {
    id: "35",
    name: "Ice maker",
    category: "Kitchen & kitchenette",
    icon: "grid",
  },

  // Bathroom
  { id: "36", name: "Shower", category: "Bathroom", icon: "shower" },
  { id: "37", name: "Toothbrush & Paste", category: "Bathroom", icon: "grid" },
  { id: "38", name: "Toilet", category: "Bathroom", icon: "grid" },
  { id: "39", name: "Sink", category: "Bathroom", icon: "grid" },
  { id: "40", name: "Bathroom Mirror", category: "Bathroom", icon: "mirror" },
  { id: "41", name: "Towels", category: "Bathroom", icon: "grid" },
  { id: "42", name: "Hair dryer", category: "Bathroom", icon: "grid" },
  { id: "43", name: "Bathroom cabinet", category: "Bathroom", icon: "grid" },
  { id: "44", name: "Soap", category: "Bathroom", icon: "grid" },

  // Security & Safety
  {
    id: "47",
    name: "Fire extinguisher",
    category: "Security & Safety",
    icon: "extinguisher",
  },
  {
    id: "48",
    name: "First aid kit",
    category: "Security & Safety",
    icon: "grid",
  },
  { id: "49", name: "CCTV", category: "Security & Safety", icon: "cctv" },
  {
    id: "50",
    name: "24/7 Security",
    category: "Security & Safety",
    icon: "grid",
  },
  { id: "51", name: "Intercom", category: "Security & Safety", icon: "grid" },
  {
    id: "52",
    name: "Security alarm",
    category: "Security & Safety",
    icon: "grid",
  },
  {
    id: "59",
    name: "Gated compound",
    category: "Security & Safety",
    icon: "grid",
  },

  // Services
  { id: "53", name: "Taxi pickup", category: "Services", icon: "taxi" },
  { id: "54", name: "Cleaning services", category: "Services", icon: "grid" },
  { id: "55", name: "Room services", category: "Services", icon: "desk-bell" },
];

// Helper function to get amenities by category
export const getAmenitiesByCategory = (category: string) => {
  return amentiies.filter((amenity) => amenity.category === category);
};

// Helper function to get all categories
export const getAmenityCategories = () => {
  return [...new Set(amentiies.map((amenity) => amenity.category))];
};

// Helper function to get amenities grouped by category
export const getGroupedAmenities = () => {
  return getAmenityCategories().reduce((acc, category) => {
    acc[category] = getAmenitiesByCategory(category);
    return acc;
  }, {} as Record<string, typeof amentiies>);
};

export const getAmenityById = (id: string): PropertyAmenity | undefined => {
  return amentiies.find((amenity) => amenity.id === id);
};

export const getAmenities = () => {
  return amentiies;
};
