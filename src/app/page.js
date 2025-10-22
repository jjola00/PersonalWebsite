
"use client";

import { useRef } from "react";
import Navigation from "@/components/navigation";
import BackgroundVideo from "@/components/BackgroundVideo";
import AmbientBackground from "@/components/AmbientBackground";
import BackgroundControls from "@/components/BackgroundControls";
import ProfileImage from "@/components/ProfileImage";
import { useBackground } from "@/components/BackgroundManager";

export default function Home() {
  const { mode, ambientEffect } = useBackground();
  const backgroundVideoRef = useRef(null);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-between relative">
        {/* Dynamic Background System */}
        {mode === 'ambient' ? (
          <AmbientBackground effect={ambientEffect} />
        ) : (
          <BackgroundVideo ref={backgroundVideoRef} />
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
