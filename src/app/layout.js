import { Ubuntu } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { BackgroundProvider } from "@/components/BackgroundManager";
import { MobileNavigationProvider } from "@/contexts/MobileNavigationContext";
import SiteBackground from "@/components/SiteBackground";
import MotionProvider from "@/components/MotionProvider";
import FireFliesBackground from "@/components/FireFliesBackground";

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={clsx(
          ubuntu.variable,
          "bg-background text-foreground font-ubuntu"
        )}
      >
        <MobileNavigationProvider>
          <BackgroundProvider>
            <MotionProvider>
              <SiteBackground />
              {children}
              <FireFliesBackground />
            </MotionProvider>
          </BackgroundProvider>
        </MobileNavigationProvider>
      </body>
    </html>
  );
}
