"use client";

import dynamic from "next/dynamic";

const WebVitalsTracker = dynamic(() => import("@/components/WebVitalsTracker"), {
  ssr: false
});

export default WebVitalsTracker;