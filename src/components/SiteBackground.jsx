"use client";

import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useBackground } from "@/components/BackgroundManager";

// Rendered once in the root layout, so the ambient canvas and wallpaper video
// survive page navigation instead of restarting on every route. Client-only:
// the choice of background lives in localStorage, which the server can't see.
const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), {
  ssr: false,
});

const BackgroundVideo = dynamic(() => import("@/components/BackgroundVideo"), {
  ssr: false,
});

const BackgroundControls = dynamic(() => import("@/components/BackgroundControls"), {
  ssr: false,
});

export default function SiteBackground() {
  const { mode, ambientEffect } = useBackground();

  return (
    <>
      <ErrorBoundary fallback={() => null}>
        {mode === "ambient" ? (
          <AmbientBackground effect={ambientEffect} />
        ) : (
          <BackgroundVideo />
        )}
      </ErrorBoundary>
      <BackgroundControls />
    </>
  );
}
