"use client";

import AboutDetails from "@/components/about";
import AmbientBackground from "@/components/AmbientBackground";
import BackgroundVideo from "@/components/BackgroundVideo";
import BackgroundControls from "@/components/BackgroundControls";
import { useBackground } from "@/components/BackgroundManager";

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

      <div className="relative w-full h-[100vh] flex flex-col items-center justify-center">
        <div className="absolute flex flex-col items-center text-center top-1/2 sm:top-[60%] left-1/2 -translate-y-1/2 -translate-x-1/2">
          <h1 className="font-bold  text-6xl xs:text-7xl sm:text-8xl  lg:text-9xl text-blue-100">
            About Me
          </h1>
          <p className="font-light text-foreground text-lg mt-2">
            Hey!
          </p>
        </div>
      </div>

      <AboutDetails />
    </>
  );
}
