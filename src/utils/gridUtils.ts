// Utility functions for dynamic grid layouts

/**
 * Calculates the optimal grid class name based on the number of visible items
 * Ensures symmetric and aesthetically pleasing layouts
 */
export const getDynamicGridClass = (
  visibleCount: number,
  options: {
    maxCols?: number;
    preferredCols?: number;
    minCols?: number;
    includeGap?: boolean;
    gapSize?: number;
  } = {}
): string => {
  const {
    maxCols = 3,
    preferredCols = 3,
    minCols = 1,
    includeGap = true,
    gapSize = 6,
  } = options;

  if (visibleCount === 0) {
    return includeGap ? `grid gap-${gapSize}` : 'grid';
  }

  // Calculate optimal columns based on visible count
  let optimalCols: number;
  
  if (visibleCount === 1) {
    optimalCols = 1;
  } else if (visibleCount === 2) {
    optimalCols = 2;
  } else if (visibleCount <= 4) {
    optimalCols = Math.min(2, maxCols);
  } else if (visibleCount <= 6) {
    optimalCols = Math.min(3, maxCols);
  } else {
    optimalCols = Math.min(preferredCols, maxCols);
  }

  // Ensure we don't go below minimum
  optimalCols = Math.max(optimalCols, minCols);

  // Generate responsive class names
  const baseClass = 'grid grid-cols-1';
  const mdClass = optimalCols > 1 ? `md:grid-cols-${optimalCols}` : '';
  const gapClass = includeGap ? `gap-${gapSize}` : '';

  return [baseClass, mdClass, gapClass].filter(Boolean).join(' ');
};

/**
 * Calculates grid layout specifically for form fields
 * Takes into account form field widths and responsive behavior
 */
export const getFormFieldGridClass = (
  visibleFields: string[],
  options: {
    fieldType?: 'input' | 'select' | 'checkbox';
    screenSize?: 'mobile' | 'tablet' | 'desktop';
  } = {}
): string => {
  const count = visibleFields.length;
  const { fieldType = 'input' } = options;

  // For form inputs, we want more conservative layouts
  if (count === 1) {
    return 'grid grid-cols-1 gap-6';
  } else if (count === 2) {
    return 'grid grid-cols-1 md:grid-cols-2 gap-6';
  } else if (count <= 4) {
    // For 3-4 fields, use 2 columns on medium screens, 3 on large
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  } else if (count <= 6) {
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  } else {
    return 'grid grid-cols-1 md:grid-cols-3 gap-6';
  }
};

/**
 * Groups fields for optimal visual layout
 * Returns field groups that should be rendered together
 */
export const groupFieldsForLayout = <T extends { name: string; visible: boolean }>(
  fields: T[],
  maxPerGroup: number = 3
): T[][] => {
  const visibleFields = fields.filter(field => field.visible);
  const groups: T[][] = [];
  
  for (let i = 0; i < visibleFields.length; i += maxPerGroup) {
    groups.push(visibleFields.slice(i, i + maxPerGroup));
  }
  
  return groups;
};

/**
 * Determines if a grid should use equal height columns
 */
export const shouldUseEqualHeight = (fieldCount: number): boolean => {
  return fieldCount > 1 && fieldCount <= 4;
};

/**
 * Gets the optimal pricing grid layout based on visible pricing fields
 */
export const getPricingGridClass = (visiblePricingFields: string[]): string => {
  const count = visiblePricingFields.length;
  
  if (count === 1) {
    return 'grid grid-cols-1 gap-4';
  } else if (count === 2) {
    return 'grid grid-cols-1 md:grid-cols-2 gap-4';
  } else if (count === 3) {
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
  } else {
    return 'grid grid-cols-1 md:grid-cols-2 gap-4';
  }
};

/**
 * Gets the optimal amenity grid layout
 */
export const getAmenityGridClass = (amenityCount: number): string => {
  if (amenityCount <= 4) {
    return 'grid grid-cols-2 gap-2 mb-4';
  } else if (amenityCount <= 8) {
    return 'grid grid-cols-2 md:grid-cols-3 gap-2 mb-4';
  } else {
    return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4';
  }
};