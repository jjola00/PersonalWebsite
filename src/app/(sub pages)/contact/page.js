"use client";

import dynamic from "next/dynamic";
import Form from "@/components/contact/Form";
import { useBackground } from "@/components/BackgroundManager";

// Dynamic imports for background components
const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-pulse" />
  )
});

const BackgroundVideo = dynamic(() => import("@/components/BackgroundVideo"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-gradient-to-br from-gray-900 to-black animate-pulse" />
  )
});

const BackgroundControls = dynamic(() => import("@/components/BackgroundControls"), {
  ssr: false,
  loading: () => null
});

export default function Contact() {
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

      <article className="relative w-full flex flex-col items-center justify-center py-8 sm:py-0 space-y-8">
        <div className="flex flex-col items-center justify-center space-y-6 w-full sm:w-3/4">
          <h1 className="text-blue-200 font-semibold text-center text-4xl capitalize">
          Contact Me
          </h1>
          <p className="text-center font-light text-sm xs:text-base">
            If you have any questions or would like to discuss a project, feel free to reach out.
          </p>
        </div>
        <Form />
      </article>
    </>
  );
}
