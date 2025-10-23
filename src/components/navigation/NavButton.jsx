import {
    Github,
    Home,
    Instagram,
    Linkedin,
    NotebookText,
    Phone,
    User,
    TestTube,
  } from "lucide-react";
  import Link from "next/link";
  import React from "react";
  import { useResponsive } from "@/hooks/useResponsive";
  import clsx from "clsx";
  import { motion } from "framer-motion";
  
  const getIcon = (icon) => {
    switch (icon) {
      case "home":
        return <Home className="w-full h-auto" strokeWidth={1.5} />;
      case "about":
        return <User className="w-full h-auto" strokeWidth={1.5} />;
      case "contact":
        return <Phone className="w-full h-auto" strokeWidth={1.5} />;
      case "github":
        return <Github className="w-full h-auto" strokeWidth={1.5} />;
      case "linkedin":
        return <Linkedin className="w-full h-auto" strokeWidth={1.5} />;
      case "instagram":
        return <Instagram className="w-full h-auto" strokeWidth={1.5} />;
      case "resume":
        return <NotebookText className="w-full h-auto" strokeWidth={1.5} />;
      case "test":
        return <TestTube className="w-full h-auto" strokeWidth={1.5} />;
  
      default:
        return <Home className="w-full h-auto" strokeWidth={1.5} />;
    }
  };
  
  const item = {
    hidden: { scale: 0 },
    show: { scale: 1 },
  };
  
  const NavLink = motion(Link);
  
const NavButton = ({
  x,
  y,
  label,
  link,
  icon,
  newTab,
  labelDirection = "right",
  isMobile = false,
}) => {
  const { width } = useResponsive();
  
  return (
    <>
      {width && width >= 768 ? (
          // Desktop/Tablet circular layout
          <div
            className="absolute cursor-pointer z-50"
            style={{ transform: `translate(${x}, ${y})` }}
          >
            <NavLink
              variants={item}
              href={link}
              target={newTab ? "_blank" : "_self"}
              className="text-foreground rounded-full flex items-center justify-center custom-bg focus-visible"
              aria-label={label}
              name={label}
              prefetch={false}
              scroll={false}
              rel={newTab ? "noopener noreferrer" : undefined}
            >
              <span className="relative w-14 h-14 p-4 animate-spin-slow-reverse group-hover:pause hover:text-blue-200">
                {getIcon(icon)}

                <span className="peer bg-transparent absolute top-0 left-0 w-full h-full" />

                <span className="absolute hidden peer-hover:block px-2 py-1 left-full mx-2 top-1/2 -translate-y-1/2 bg-background text-foreground text-sm rounded-md shadow-lg whitespace-nowrap">
                  {label}
                </span>
              </span>
            </NavLink>
          </div>
        ) : (
          // Mobile layout
          <div className="w-full cursor-pointer z-50">
            <NavLink
              variants={item}
              href={link}
              target={newTab ? "_blank" : "_self"}
              className={clsx(
                "text-foreground rounded-lg flex items-center justify-start gap-4 p-3 w-full focus-visible accessible-touch-target",
                isMobile ? "hover:bg-white/10 transition-colors" : "custom-bg rounded-full justify-center"
              )}
              aria-label={label}
              name={label}
              prefetch={false}
              scroll={false}
              rel={newTab ? "noopener noreferrer" : undefined}
            >
              <span className={clsx(
                "flex items-center justify-center hover:text-blue-200",
                isMobile ? "w-6 h-6" : "relative w-10 h-10 xs:w-14 xs:h-14 p-2.5 xs:p-4"
              )}>
                {getIcon(icon)}
                
                {!isMobile && (
                  <>
                    <span className="peer bg-transparent absolute top-0 left-0 w-full h-full" />
                    <span
                      className={clsx(
                        "absolute hidden peer-hover:block px-2 py-1 left-full mx-2 top-1/2 -translate-y-1/2 bg-background text-foreground text-sm rounded-md shadow-lg whitespace-nowrap",
                        labelDirection === "left" ? "right-full left-auto" : ""
                      )}
                    >
                      {label}
                    </span>
                  </>
                )}
              </span>
              
              {isMobile && (
                <span className="text-responsive-md font-medium">{label}</span>
              )}
            </NavLink>
          </div>
        )}
    </>
  );
};  export default NavButton;