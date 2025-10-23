import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { BackgroundProvider } from "@/components/BackgroundManager";
import { MobileNavigationProvider } from "@/contexts/MobileNavigationContext";

// Import global error handler (initializes on import)
import "@/utils/errorHandler";

// Dynamic import for FireFliesBackground to reduce initial bundle size
const FireFliesBackground = dynamic(() => import("@/components/FireFliesBackground"), {
  ssr: false,
  loading: () => null
});

// Dynamic import for Web Vitals tracking
const WebVitalsTracker = dynamic(() => import("@/components/WebVitalsTracker"), {
  ssr: false
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: {
    template: "%s | Jay",
    default: "Jay",
  },
  description:
    "My personal website and portfolio, showcasing my projects and blog posts theme based on my favorite anime.",
  icons: {
    icon: '/pfp.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body
        className={clsx(
          inter.variable,
          "bg-background text-foreground font-inter"
        )}
      >
        <MobileNavigationProvider>
          <BackgroundProvider>
            {children}
            <FireFliesBackground />
            <WebVitalsTracker />
          </BackgroundProvider>
        </MobileNavigationProvider>
      </body>
    </html>
  );
}