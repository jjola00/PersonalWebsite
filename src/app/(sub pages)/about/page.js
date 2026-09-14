"use client";

import dynamic from "next/dynamic";
import AboutDetails from "@/components/about";
import BackgroundControls from "@/components/BackgroundControls";
import { useBackground } from "@/components/BackgroundManager";

const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), {
  ssr: false,
});

const BackgroundVideo = dynamic(() => import("@/components/BackgroundVideo"), {
  ssr: false,
});

export default function About() {
  const { mode, ambientEffect } = useBackground();

  return (
    <>
      {/* Dynamic Background System */}
      {mode === 'ambient' ? (
        <AmbientBackground effect={ambientEffect} />
      ) : (
        <BackgroundVideo />
      )}

      {/* Background Controls */}
      <BackgroundControls />

      <div className="w-full flex flex-col items-center text-center mb-8">
        <h1 className="font-bold text-4xl text-blue-100">
          About Me
        </h1>
      </div>

      <AboutDetails />
    </>
  );
}
