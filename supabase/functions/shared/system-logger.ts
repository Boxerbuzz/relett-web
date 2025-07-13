export const systemLogger = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SYSTEM-LOGGER] ${step} - ${detailsStr}`);
};
