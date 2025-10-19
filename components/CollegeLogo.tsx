"use client";
import { useState } from "react";

interface CollegeLogoProps {
  name: string;
  website?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CollegeLogo({ name, website, size = "md", className = "" }: CollegeLogoProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base"
  };
  
  // Extract domain from website or try to guess it
  const getDomain = () => {
    if (website) {
      try {
        const url = new URL(website.startsWith('http') ? website : `https://${website}`);
        return url.hostname;
      } catch {
        return null;
      }
    }
    
    const lowerName = name.toLowerCase();
    
    // Comprehensive list of common college domains
    const domainMap: Record<string, string> = {
      'mit': 'mit.edu',
      'stanford': 'stanford.edu',
      'harvard': 'harvard.edu',
      'yale': 'yale.edu',
      'princeton': 'princeton.edu',
      'caltech': 'caltech.edu',
      'columbia': 'columbia.edu',
      'cornell': 'cornell.edu',
      'dartmouth': 'dartmouth.edu',
      'brown': 'brown.edu',
      'upenn': 'upenn.edu',
      'penn': 'upenn.edu',
      'duke': 'duke.edu',
      'northwestern': 'northwestern.edu',
      'chicago': 'uchicago.edu',
      'johns hopkins': 'jhu.edu',
      'washington': 'uw.edu',
      'berkeley': 'berkeley.edu',
      'ucla': 'ucla.edu',
      'usc': 'usc.edu',
      'michigan': 'umich.edu',
      'nyu': 'nyu.edu',
      'carnegie mellon': 'cmu.edu',
      'georgetown': 'georgetown.edu',
      'rice': 'rice.edu',
      'vanderbilt': 'vanderbilt.edu',
      'notre dame': 'nd.edu',
      'emory': 'emory.edu',
      'boston': 'bu.edu',
    };
    
    // Check if any key matches
    for (const [key, domain] of Object.entries(domainMap)) {
      if (lowerName.includes(key)) {
        return domain;
      }
    }
    
    // Try to guess domain from college name
    const cleanName = lowerName
      .replace(/university|college|institute|school/gi, '')
      .trim()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    
    return cleanName ? `${cleanName}.edu` : null;
  };
  
  const domain = getDomain();
  
  // UI Avatars fallback
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&size=128&bold=true`;
  
  // Try Clearbit logo API first (higher quality), then Google favicon
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null;
  
  // Check if image is a generic placeholder (very small file size or specific dimensions)
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // If image is too small (likely a placeholder), use fallback
    if (img.naturalWidth < 32 || img.naturalHeight < 32) {
      setUseFallback(true);
    } else {
      setImageLoaded(true);
    }
  };
  
  if (useFallback || !domain) {
    return (
      <div className={`relative flex-shrink-0 ${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden ${className}`}>
        <img 
          src={fallbackUrl} 
          alt={name}
        />
      </div>
    );
  }
  
  // Try favicon directly (simpler approach)
  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden ${className}`}>
      <img 
        src={faviconUrl || fallbackUrl}
        alt={name}
        onLoad={handleImageLoad}
        onError={() => setUseFallback(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
