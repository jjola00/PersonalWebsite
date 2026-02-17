import { Ubuntu } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { BackgroundProvider } from "@/components/BackgroundManager";
import { MobileNavigationProvider } from "@/contexts/MobileNavigationContext";
import ClientFireFliesBackground from "@/components/ClientFireFliesBackground";
import ClientWebVitalsTracker from "@/components/ClientWebVitalsTracker";

// Import global error handler (initializes on import)
import "@/utils/errorHandler";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
});

export const metadata = {
  title: {
    template: "%s | Jay",
    default: "Jay",
  },
  description:
    "Le personal website.",
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
          ubuntu.variable,
          "bg-background text-foreground font-ubuntu"
        )}
      >
        <MobileNavigationProvider>
          <BackgroundProvider>
            {children}
            <ClientFireFliesBackground />
            <ClientWebVitalsTracker />
          </BackgroundProvider>
        </MobileNavigationProvider>
      </body>
    </html>
  );
}