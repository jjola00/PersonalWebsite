"use client";
import { BtnList } from "@/app/data";
import React, { useState } from "react";
import NavButton from "./NavButton";
import { useResponsive } from "@/hooks/useResponsive";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const mobileMenuVariants = {
  hidden: { 
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.3
    }
  },
  visible: { 
    opacity: 1,
    x: "0%",
    transition: {
      duration: 0.3
    }
  }
};

const Navigation = () => {
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useMobileNavigation();
  const angleIncrement = 360 / BtnList.length;
  const { width, isDesktop } = useResponsive();
  const [isClient, setIsClient] = useState(false);
  const isLarge = width >= 1024;
  const isMedium = width >= 768;

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by showing loading state until client-side
  if (!isClient) {
    return (
      <div className="w-full fixed h-screen flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full fixed h-screen flex items-center justify-center">
      {isDesktop ? (
            // Desktop/Tablet circular navigation
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="w-max flex items-center justify-center relative hover:pause animate-spin-slow group"
            >
              {BtnList.map((btn, index) => {
                const angleRad = (index * angleIncrement * Math.PI) / 180;
                const radius = isLarge
                  ? "calc(20vw - 1rem)"
                  : isMedium
                  ? "calc(30vw - 1rem)"
                  : "calc(40vw - 1rem)";
                const x = `calc(${radius}*${Math.cos(angleRad)})`;
                const y = `calc(${radius}*${Math.sin(angleRad)})`;

                return <NavButton key={btn.label} x={x} y={y} {...btn} />;
              })}
            </motion.div>
          ) : (
            // Mobile navigation with hamburger menu
            <>
              {/* Mobile menu button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                onClick={toggleMobileMenu}
                className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full custom-bg flex items-center justify-center text-foreground hover:text-accent transition-colors accessible-touch-target focus-visible"
                aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Menu className="w-6 h-6" strokeWidth={1.5} aria-hidden="true" />
                )}
              </motion.button>

              {/* Mobile menu overlay */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.nav
                    variants={mobileMenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed top-0 right-0 w-64 h-full bg-background/95 backdrop-blur-md border-l border-white/20 z-40 flex flex-col justify-center focus-trap"
                    id="mobile-navigation-menu"
                    role="navigation"
                    aria-label="Mobile navigation"
                  >
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="flex flex-col space-y-6 px-8"
                      role="list"
                    >
                      {BtnList.map((btn) => (
                        <div
                          key={btn.label}
                          onClick={closeMobileMenu}
                          className="w-full"
                          role="listitem"
                        >
                          <NavButton 
                            x={0} 
                            y={0} 
                            {...btn} 
                            isMobile={true}
                          />
                        </div>
                      ))}
                    </motion.div>
                  </motion.nav>
                )}
              </AnimatePresence>

              {/* Mobile menu backdrop */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                  />
                )}
              </AnimatePresence>
            </>
          )}
    </div>
  );
};

export default Navigation;