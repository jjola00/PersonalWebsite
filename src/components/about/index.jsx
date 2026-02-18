import ItemLayout from "./ItemLayout";
import Image from "next/image";
import dynamic from "next/dynamic";
import ProjectCard from "./ProjectCard";
import { getAllProjects } from "../../data/projects";

const MusicSection = dynamic(() => import("./MusicSection"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">🎵</div>
        <p className="text-gray-400 text-sm">Loading music...</p>
      </div>
    </div>
  ),
});

const MovieSection = dynamic(() => import("./MovieSection"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">🎬</div>
        <p className="text-gray-400 text-sm">Loading movies...</p>
      </div>
    </div>
  ),
});

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

const topLanguages = [
  { name: 'Python', percentage: 43.12, color: '#3B82F6' },
  { name: 'TypeScript', percentage: 23.08, color: '#1D4ED8' },
  { name: 'JavaScript', percentage: 13.89, color: '#FEFE5B' },
  { name: 'C++', percentage: 5.76, color: '#F43F7D' },
  { name: 'HTML', percentage: 4.61, color: '#F97316' },
  { name: 'CSS', percentage: 3.86, color: '#7E22CE' },
  { name: 'C', percentage: 2.87, color: '#6B7280' },
  { name: 'Jupyter Notebook', percentage: 2.81, color: '#EA580C' }
];

// Projects data is now imported from centralized data file

const AboutDetails = () => {
  const projects = getAllProjects();
  
  return (
    <section className="w-full bg-gradient-to-r ">
      {/* Technologies */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10">
          {technologyLogos.map((item) => (
            <div key={item.name} className="group relative flex flex-col items-center">
              <Image
                src={item.logo}
                alt={item.alt}
                width={80}
                height={80}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover object-center rounded-lg filter grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out group-hover:scale-110"
              />
              <span className="mt-2 text-xs sm:text-sm text-white/0 group-hover:text-white transition-all duration-300 font-medium">
                {item.name}
              </span>
            </div>
          ))}
        </div>
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

      {/* Companies */}
      <div className="mt-8 sm:mt-12 mb-8 sm:mb-12">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10">
          {companyLogos.map((item) => (
            <div key={item.name} className="group relative flex flex-col items-center">
              <Image
                src={item.logo}
                alt={item.alt}
                width={80}
                height={80}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover object-center rounded-lg filter grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out group-hover:scale-110"
              />
              <span className="mt-2 text-xs sm:text-sm text-white/0 group-hover:text-white transition-all duration-300 font-medium">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 xs:gap-6  md:gap-8 w-full">
        {[
          { repo: "LinuxConfig", alt: "LinuxConfig Repo" },
          { repo: "FinalZork", alt: "FinalZork Repo" },
          { repo: "amyWeb", alt: "amyWeb Repo" },
        ].map((pin) => (
          <ItemLayout
            key={pin.repo}
            className={"col-span-full sm:col-span-6 md:col-span-4 !p-0"}
          >
            <a href={`https://github.com/jjola00/${pin.repo}`} target="_blank" rel="noopener noreferrer" className="w-full">
              <Image
                className="w-full h-auto hover:opacity-80 transition-opacity"
                src={`${process.env.NEXT_PUBLIC_GITHUB_STATS_URL}/api/pin/?username=jjola00&repo=${pin.repo}&theme=transparent&hide_border=true&title_color=FEFE5B&text_color=FFFFFF&icon_color=FEFE5B`}
                alt={pin.alt}
                width={400}
                height={150}
                loading="lazy"
                unoptimized
              />
            </a>
          </ItemLayout>
        ))}

        <ItemLayout className={"col-span-full md:col-span-7 !p-0 items-start justify-start self-start"}>
          <Image
            className="w-full h-auto"
            src={`${process.env.NEXT_PUBLIC_GITHUB_STATS_URL}/api?username=jjola00&theme=transparent&hide_border=true&title_color=FEFE5B&text_color=FFFFFF&icon_color=FEFE5B&show_icons=true&rank_icon=github`}
            alt="GitHub Stats"
            width={500}
            height={200}
            loading="lazy"
            unoptimized
          />
        </ItemLayout>

        <ItemLayout className={"col-span-full md:col-span-5 !p-5 sm:!p-6 items-start justify-start overflow-hidden self-stretch h-full"}>
          <div className="w-full h-full flex flex-col gap-4">
            <h3 className="text-2xl sm:text-4xl font-semibold leading-tight" style={{ color: '#FEFE5B' }}>
              Most Used Languages
            </h3>

            <div className="w-full h-3 rounded-full overflow-hidden bg-white/20 flex">
              {topLanguages.map((language) => (
                <div
                  key={language.name}
                  className="h-full"
                  style={{ width: `${language.percentage}%`, backgroundColor: language.color }}
                  aria-hidden="true"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 auto-rows-fr">
              {topLanguages.map((language, index) => (
                <div
                  key={language.name}
                  className={`min-w-0 h-full rounded-md px-3 py-2 flex items-center justify-between ${
                    index % 2 === 0 ? 'bg-white/10' : 'bg-white/5'
                  }`}
                >
                  <span className="min-w-0 pr-2 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: language.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-sm sm:text-base">{language.name}</span>
                  </span>
                  <span className="shrink-0 text-sm sm:text-base font-medium">
                    {language.percentage.toFixed(2)}%
                  </span>
                </div>
              ))}
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
