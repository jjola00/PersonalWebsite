/* eslint-disable @next/next/no-img-element */
import ItemLayout from "./ItemLayout";
import Link from "next/link";
import MusicSection from "./MusicSection";
import MovieSection from "./MovieSection";
import InfiniteCarousel from "./InfiniteCarousel";
import ProjectCard from "./ProjectCard";

// Technology logos data
const technologyLogos = [
  { name: 'React', logo: '/technologies/React.png', alt: 'React' },
  { name: 'JavaScript', logo: '/technologies/JavaScript.png', alt: 'JavaScript' },
  { name: 'TypeScript', logo: '/technologies/TypeScript.png', alt: 'TypeScript' },
  { name: 'Python', logo: '/technologies/Python.jpg', alt: 'Python' },
  { name: 'Java', logo: '/technologies/Java.png', alt: 'Java' },
  { name: 'C++', logo: '/technologies/Cpp.png', alt: 'C++' },
  { name: 'SQL', logo: '/technologies/SQL.png', alt: 'SQL' },
  { name: 'GitHub', logo: '/technologies/Github.png', alt: 'GitHub' }
];

// Company logos data
const companyLogos = [
  { name: 'ISE', logo: '/experience/ISE.jpeg', alt: 'ISE' },
  { name: 'Puzz', logo: '/experience/Puzz.jpeg', alt: 'Puzz' },
  { name: 'Patch', logo: '/experience/Patch.jpeg', alt: 'Patch' },
  { name: 'Dogpatch Labs', logo: '/experience/Dogpatch_Labs.jpeg', alt: 'Dogpatch Labs' },
  { name: 'Talio', logo: '/experience/Talio.jpeg', alt: 'Talio' },
  { name: 'DevEire', logo: '/experience/Deveire.jpeg', alt: 'DevEire' }
];

// Projects data (user-provided)
const projects = [
  {
    id: 1,
    title: "StableWise",
    description:
      "StableWise is an online marketplace for showjumping horses and ponies(literally Linkedin for horses), featuring verified international competition data, AI-powered performance analysis, and advanced search tools to empower serious buyers and sellers. Built with a React TypeScript frontend, Supabase backend for secure real-time data and authentication, Netlify deployment, and Zoho email integration, it's live at stablewise.org",
    status: "MVP",
    imageUrl: "/projects/stablewise-demo.png",
    demoLink: "https://stablewise.org",
  },
  {
    id: 2,
    title: "Aicoholics",
    description:
      "A deep learning project exploring vehicle classification using multiple neural network architectures, with practical applications in automated toll systems. Implemented the DenseNet model and data preprocessing pipeline. Compares DenseNet, a custom CNN, and AlexNet to classify vehicles without license plate recognition. Built with Python, PyTorch, and Flask with notebooks, visualization, web UI, trained models, evaluation scripts, and DB management.",
    status: "Completed",
    imageUrl: "/projects/aicoholics-demo.png",
    demoLink: "https://github.com/ISE-CS4445-AI/ai-project-aicoholics",
  },
  {
    id: 3,
    title: "Ecosim",
    description:
      "Ecosim is a Java-based interactive simulation between animals, plants, and environments across desert and grassland biomes. Users can configure setups and monitor real-time evolution through daily reports. Built with Maven, modular architecture using Builder and Observer patterns, JSON-configured biomes/weather, and comprehensive unit tests, with easy launch scripts.",
    status: "Completed",
    imageUrl: "/projects/ecosim-demo.png",
    demoLink: "https://github.com/darragh0/ecosim",
  },
  {
    id: 4,
    title: "Fuzzle",
    description:
      "Fuzzle is a cross-platform mobile app that helps parents track their children's study habits, connected to a Raspberry Pi-based physical \"pet cat\" device that indicates focus vs. distraction. Built with Flutter (and a React Native version), includes Bluetooth pairing, data storage, tests, code quality checks, accessibility, and launch scripts for Linux/Windows/Android.",
    status: "MVP",
    imageUrl: "/projects/fuzzle-demo.jpg",
    demoLink: "https://github.com/jjola00/Fuzzle",
  },
  {
    id: 5,
    title: "Zork",
    description:
      "Zork is a text-based adventure game inspired by The House in Fata Morgana with a GUI and custom artwork. Updated with build scripts and docs for modern systems while preserving original code as a snapshot. Built in C++ using Qt with quick-launch scripts for Linux/macOS and Windows.",
    status: "Completed",
    imageUrl: "/projects/zork-demo.png",
    demoLink: "https://github.com/jjola00/FinalZork",
  },
  {
    id: 6,
    title: "Leet Code Adventures",
    description:
      "An ongoing diary capturing LeetCode attempts and enhanced solutions, organized by topics like two pointers and binary search. Initially in C++, now in Python. Inspired by prep for AWS SDE Interview and future internships.",
    status: "Ongoing",
    imageUrl: "/projects/leetcode-demo.png",
    demoLink: "https://github.com/jjola00/LeetCodeAdventures",
  },
];

const AboutDetails = () => {
  return (
    <section className="w-full bg-gradient-to-r ">
      {/* Technology Carousel - ABOVE intro */}
      <div className="mb-8 sm:mb-12">
        <InfiniteCarousel 
          items={technologyLogos} 
          direction="left"
          speed={20}
        />
      </div>
      
      <div className="grid grid-cols-12 gap-4 xs:gap-6  md:gap-8 w-full">
        <ItemLayout
          className={
            " col-span-full lg:col-span-8 row-span-2 flex-col items-start"
          }
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold" style={{color: '#FEFE5B'}}>
            Software Developer @ ISE
          </h2>
          <p className="font-light text-xs sm:text-sm md:text-base">
            I’m a software developer with experience across full-stack engineering and early-stage product building. I’ve worked with technologies like React, TypeScript, Node.js, Java, and Python, building everything from multiplayer web apps to AI-driven tools. I enjoy turning ideas into real products, whether that’s creating Puzz, an online party game platform, or building StableWise, a show-horse marketplace MVP powered by data scraping and AI summaries.
          </p>
          <p className="font-light mt-2 text-xs sm:text-sm md:text-base">
            I’ve gained practical experience through roles at DevEire, Dogpatch Labs, Patch, and Talio, where I contributed to frontend development, backend features, automation tools and early product direction. I focus on usability, performance and delivering features that make an impact.
          </p>
        </ItemLayout>

        <ItemLayout
          className={" col-span-full xs:col-span-6 lg:col-span-4 text-white"}
        >
          <p className="font-semibold w-full text-left text-2xl sm:text-5xl" style={{color: '#FEFE5B'}}>
            8+ <sub className="font-semibold text-base" style={{color: 'white'}}>technologies</sub>
          </p>
        </ItemLayout>

        <ItemLayout
          className={"col-span-full xs:col-span-6 lg:col-span-4 text-white"}
        >
          <p className="font-semibold w-full text-left text-2xl sm:text-5xl" style={{color: '#FEFE5B'}}>
            1+{" "}
            <sub className="font-semibold text-base" style={{color: 'white'}}>year of experience</sub>
          </p>
        </ItemLayout>
      </div>

      {/* Company Carousel - BELOW intro section */}
      <div className="mt-8 sm:mt-12 mb-8 sm:mb-12">
        <InfiniteCarousel 
          items={companyLogos} 
          direction="right"
          speed={18}
        />
      </div>

      <div className="grid grid-cols-12 gap-4 xs:gap-6  md:gap-8 w-full">
        <ItemLayout
          className={"col-span-full sm:col-span-6 md:col-span-4 !p-0"}
        >
          <img
            className="w-full h-auto"
            src={`${process.env.NEXT_PUBLIC_GITHUB_STATS_URL}/api/top-langs?username=jjola00&theme=transparent&hide_border=true&title_color=FEFE5B&text_color=FFFFFF&icon_color=FEFE5B&text_bold=false`}
            alt="jjola00"
            width={400}
            height={300}
            loading="lazy"
          />
        </ItemLayout>

        <ItemLayout className={"col-span-full md:col-span-8 !p-0"}>
          <div className="relative">
            <img
              className="w-full h-auto"
              src={`https://github-readme-activity-graph.vercel.app/graph?username=jjola00&theme=react-dark&hide_border=true&title_color=FEFE5B&text_color=FFFFFF&icon_color=FEFE5B&line=FEFE5B&point=FFFFFF&area=true&area_color=1F2937`}
              alt="jjola00"
              width={800}
              height={300}
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
              Last 30 Days
            </div>
          </div>
        </ItemLayout>

        <ItemLayout className={"col-span-full"}>
          <div className="space-y-6 w-full">
            <h2 className="text-responsive-xl font-semibold text-center md:text-left" style={{color: '#FEFE5B'}}>
              Projects
            </h2>
            <div className="h-[400px] sm:h-[500px] md:h-[600px] overflow-y-auto glass-scrollbar pr-1 md:pr-2">
              <div className="space-y-6 md:space-y-8">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          </div>
        </ItemLayout>


        {/* Music Section */}
        <ItemLayout className={"col-span-full !p-4"}>
          <MusicSection />
        </ItemLayout>

        {/* Movie Section */}
        <ItemLayout className={"col-span-full !p-4"}>
          <MovieSection />
        </ItemLayout>
      </div>
    </section>
  );
};

export default AboutDetails;
