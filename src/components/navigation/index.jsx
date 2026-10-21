"use client";
import { BtnList } from "@/app/data";
import NavButton from "./NavButton";
import { m, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useMobileNavigation } from "@/contexts/MobileNavigationContext";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

  // Both layouts are rendered and CSS breakpoints pick one, so the nav is in the
  // server HTML instead of waiting for JS to measure the window.
  return (
    <div className="w-full fixed h-screen flex items-center justify-center">
      {/* Desktop/Tablet circular navigation. The circle's radius comes from
          --nav-radius so it can follow the breakpoints. */}
      <m.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-max hidden md:flex items-center justify-center relative hover:pause animate-spin-slow group [--nav-radius:calc(30vw_-_1rem)] lg:[--nav-radius:calc(20vw_-_1rem)]"
      >
        {BtnList.map((btn, index) => {
          const angleRad = (index * angleIncrement * Math.PI) / 180;
          const x = `calc(var(--nav-radius)*${Math.cos(angleRad)})`;
          const y = `calc(var(--nav-radius)*${Math.sin(angleRad)})`;

          return <NavButton key={btn.label} x={x} y={y} {...btn} />;
        })}
      </m.div>

      {/* Mobile navigation with hamburger menu */}
      <div className="md:hidden">
        {/* Mobile menu button */}
        <m.button
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
        </m.button>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <m.nav
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed top-0 right-0 w-64 h-full bg-background/95 backdrop-blur-md border-l border-white/20 z-40 flex flex-col justify-center focus-trap"
              id="mobile-navigation-menu"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <m.div
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
              </m.div>
            </m.nav>
          )}
        </AnimatePresence>

        {/* Mobile menu backdrop */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <m.div
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
      </div>
    </div>
  );
};

export default Navigation;