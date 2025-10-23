
"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/navigation";
import ProfileImage from "@/components/ProfileImage";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useBackground } from "@/components/BackgroundManager";

// Dynamic imports for heavy background components
const BackgroundVideo = dynamic(() => import("@/components/BackgroundVideo"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-gradient-to-br from-gray-900 to-black animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading background...</div>
      </div>
    </div>
  )
});

const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading ambient effect...</div>
      </div>
    </div>
  )
});

const BackgroundControls = dynamic(() => import("@/components/BackgroundControls"), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const { mode, ambientEffect } = useBackground();
  const backgroundVideoRef = useRef(null);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-between relative">
        {/* Dynamic Background System */}
        {mode === 'ambient' ? (
          <ErrorBoundary fallbackMessage="Background effect failed to load" showRetry={true}>
            <AmbientBackground effect={ambientEffect} />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary fallbackMessage="Background video failed to load" showRetry={true}>
            <BackgroundVideo ref={backgroundVideoRef} />
          </ErrorBoundary>
        )}

        {/* Background Controls */}
        <BackgroundControls />

        <div className="w-full h-screen">
          <Navigation/>
          <ProfileImage className="-z-10" />
        </div>

      </div>
    </>
  );
}
