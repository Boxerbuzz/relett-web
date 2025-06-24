export const sanitizeTextSearchQuery = (query: string): string => {
  // Remove special characters that cause tsquery issues
  return query
    .replace(/[^\w\s]/g, " ") // Replace special chars with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim()
    .split(" ")
    .filter((word) => word.length > 0)
    .join(" & "); // Join with AND operator for tsquery
};
