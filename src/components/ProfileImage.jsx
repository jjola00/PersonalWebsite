"use client";

import Image from "next/image";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";

const ProfileImage = ({ className = "" }) => {
  const { isMobileMenuOpen } = useMobileNavigation();
  
  return (
    <div className={`flex items-center justify-center h-full transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${className}`}>
      <Image
        src="/pfp.png"
        alt="Profile"
        width={384}
        height={384}
        className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full animate-float mx-auto drop-shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow duration-300"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))'
        }}
        priority
      />
    </div>
  );
};

export default ProfileImage;
