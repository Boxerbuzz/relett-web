
// Device fingerprinting utility for security tracking
export interface DeviceFingerprint {
  deviceId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

export function generateDeviceFingerprint(): DeviceFingerprint {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenResolution = `${screen.width}x${screen.height}`;
  
  // Generate a unique device ID based on available characteristics
  const deviceInfo = [
    userAgent,
    platform,
    screenResolution,
    timezone,
    language,
    navigator.hardwareConcurrency || 'unknown',
    navigator.maxTouchPoints || 0
  ].join('|');
  
  // Simple hash function for device ID
  const deviceId = btoa(deviceInfo).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  
  // Determine device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/Mobile|Android|iPhone/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/iPad|Tablet/i.test(userAgent)) {
    deviceType = 'tablet';
  }
  
  // Generate device name
  let deviceName = 'Unknown Device';
  if (deviceType === 'mobile') {
    if (/iPhone/i.test(userAgent)) deviceName = 'iPhone';
    else if (/Android/i.test(userAgent)) deviceName = 'Android Phone';
  } else if (deviceType === 'tablet') {
    if (/iPad/i.test(userAgent)) deviceName = 'iPad';
    else deviceName = 'Tablet';
  } else {
    if (/Windows/i.test(platform)) deviceName = 'Windows Computer';
    else if (/Mac/i.test(platform)) deviceName = 'Mac Computer';
    else if (/Linux/i.test(platform)) deviceName = 'Linux Computer';
  }
  
  return {
    deviceId,
    deviceType,
    deviceName,
    userAgent,
    screenResolution,
    timezone,
    language,
    platform
  };
}

export function formatDeviceInfo(fingerprint: DeviceFingerprint): string {
  return `${fingerprint.deviceName} (${fingerprint.deviceType})`;
}
