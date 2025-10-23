"use client";

import dynamic from "next/dynamic";

const FireFliesBackground = dynamic(() => import("@/components/FireFliesBackground"), {
  ssr: false,
  loading: () => null
});

export default FireFliesBackground;