"use client";

import Form from "@/components/contact/Form";
import AmbientBackground from "@/components/AmbientBackground";
import BackgroundVideo from "@/components/BackgroundVideo";
import BackgroundControls from "@/components/BackgroundControls";
import { useBackground } from "@/components/BackgroundManager";

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
