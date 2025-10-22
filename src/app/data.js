
const baseBtnList = [
  { label: "About", link: "/about", icon: "about", newTab: false },
  { label: "Contact", link: "/contact", icon: "contact", newTab: false },
  {
    label: "Github",
    link: "https://github.com/jjola00",
    icon: "github",
    newTab: true,
  },
  {
    label: "LinkedIn",
    link: "https://www.linkedin.com/in/jay-jay-olajitan/",
    icon: "linkedin",
    newTab: true,
  },
  {
    label: "Resume",
    link: "/resume.pdf",
    icon: "resume",
    newTab: true,
  },
];

// Add test page link in development mode
export const BtnList = process.env.NODE_ENV === 'development' 
  ? [
      ...baseBtnList,
      { label: "Test Movies", link: "/test-movies", icon: "test", newTab: false },
    ]
  : baseBtnList;


