
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/lib/auth';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

export function UserAvatar({ size = 'md', className, showFallback = true }: UserAvatarProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [imageError, setImageError] = useState(false);

  // Get user's name for initials and DiceBear seed
  const firstName = profile?.first_name || '';
  const lastName = profile?.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  
  // Use email as seed for DiceBear if no name available
  const seed = fullName || user?.email || 'default';
  
  // DiceBear avatar URL with consistent style
  const dicebearUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b82f6&textColor=ffffff`;
  
  // Priority: uploaded avatar > DiceBear > initials fallback
  const avatarUrl = profile?.avatar && !imageError ? profile.avatar : dicebearUrl;

  return (
    <Avatar className={`${sizeClasses[size]} ${className || ''}`}>
      <AvatarImage 
        src={avatarUrl} 
        alt={fullName || 'User avatar'}
        onError={() => setImageError(true)}
      />
      {showFallback && (
        <AvatarFallback className="bg-blue-600 text-white font-medium">
          {initials || user?.email?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
