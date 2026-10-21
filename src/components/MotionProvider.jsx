"use client";

import { LazyMotion, domAnimation } from "framer-motion";

// Components animate with the slim `m` component instead of `motion`, and this
// supplies only the DOM animation features they use (animate, variants, exit,
// whileInView) — a fraction of the full framer-motion bundle. `strict` throws
// if a full `motion` component sneaks back in and undoes the saving.
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
