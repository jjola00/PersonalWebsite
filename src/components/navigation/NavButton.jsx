import {
    Folder,
    Github,
    Home,
    Instagram,
    Linkedin,
    NotebookText,
    Phone,
    User,
  } from "lucide-react";
  import Link from "next/link";
  import { m } from "framer-motion";

  const getIcon = (icon) => {
    switch (icon) {
      case "home":
        return <Home className="w-full h-auto" strokeWidth={1.5} />;
      case "about":
        return <User className="w-full h-auto" strokeWidth={1.5} />;
      case "projects":
        return <Folder className="w-full h-auto" strokeWidth={1.5} />;
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

      default:
        return <Home className="w-full h-auto" strokeWidth={1.5} />;
    }
  };

  const item = {
    hidden: { scale: 0 },
    show: { scale: 1 },
  };

  const NavLink = m.create(Link);

// `isMobile` picks the layout: a row in the slide-out mobile menu, or an icon
// on the spinning desktop circle (positioned by x/y).
const NavButton = ({
  x,
  y,
  label,
  link,
  icon,
  newTab,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <div className="w-full cursor-pointer z-50">
        <NavLink
          variants={item}
          href={link}
          target={newTab ? "_blank" : "_self"}
          className="text-foreground rounded-lg flex items-center justify-start gap-4 p-3 w-full focus-visible accessible-touch-target hover:bg-white/10 transition-colors"
          aria-label={label}
          name={label}
          scroll={false}
          rel={newTab ? "noopener noreferrer" : undefined}
        >
          <span className="flex items-center justify-center hover:text-blue-200 w-6 h-6">
            {getIcon(icon)}
          </span>
          <span className="text-responsive-md font-medium">{label}</span>
        </NavLink>
      </div>
    );
  }

  return (
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
        scroll={false}
        rel={newTab ? "noopener noreferrer" : undefined}
      >
        <span className="relative w-14 h-14 p-4 animate-spin-slow-reverse group-hover:pause hover:text-blue-200">
          {getIcon(icon)}

          <span className="absolute px-2 py-1 left-full mx-2 top-1/2 -translate-y-1/2 bg-background text-foreground text-sm rounded-md shadow-lg whitespace-nowrap">
            {label}
          </span>
        </span>
      </NavLink>
    </div>
  );
};

export default NavButton;
