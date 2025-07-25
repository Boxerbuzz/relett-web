/**
 * System logger utility for consistent logging across Edge Functions
 * @param step - The logging step or context
 * @param details - Optional details to log (will be JSON stringified)
 */
export const systemLogger = (step: string, details?: unknown) => {
  const timestamp = new Date().toISOString();
  let detailsStr = "";
  
  if (details !== undefined) {
    try {
      detailsStr = ` - ${JSON.stringify(details)}`;
    } catch (error) {
      // Handle circular references or other JSON.stringify errors
      console.error("Error stringifying details:", error);
      detailsStr = ` - [Unable to serialize details: ${String(details)}]`;
    }
  }
  
  console.log(`[${timestamp}] ${step}${detailsStr}`);
};
