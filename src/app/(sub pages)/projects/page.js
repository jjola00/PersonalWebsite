import ProjectCard from "@/components/projects/ProjectCard";
import { getFeaturedProject, getOtherProjects } from "@/data/projects";

export const metadata = {
  title: "Projects",
};

export default function Projects() {
  const featuredProject = getFeaturedProject();
  const otherProjects = getOtherProjects();

  return (
    <article className="relative w-full flex flex-col items-center justify-center py-8 sm:py-0 space-y-8 min-h-screen">
      <div className="flex flex-col items-center justify-center space-y-6 w-full sm:w-3/4 max-w-6xl px-4">
        <h1 className="text-blue-200 font-semibold text-center text-4xl capitalize">
          My Projects
        </h1>
        <p className="text-center font-light text-sm xs:text-base max-w-2xl">
          Some of the projects I&apos;ve worked on
        </p>
      </div>

      <div className="w-full max-w-7xl px-4">
        {featuredProject && (
          <>
            <h2 className="text-3xl font-semibold text-blue-100 mb-8 text-center">⭐ Featured ⭐</h2>
            <div className="flex justify-center mb-16">
              <div className="w-full max-w-4xl">
                <ProjectCard project={featuredProject} featured={true} />
              </div>
            </div>
          </>
        )}

        <h2 className="text-2xl font-semibold text-blue-100 mb-6 text-center">Other Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherProjects.map((project) => (
            <ProjectCard key={project.id} project={project} featured={false} />
          ))}
        </div>
      </div>
    </article>
  );
}
