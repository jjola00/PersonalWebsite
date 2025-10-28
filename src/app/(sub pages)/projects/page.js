"use client";

import dynamic from "next/dynamic";
import { useBackground } from "@/components/BackgroundManager";
import ProjectCard from "@/components/projects/ProjectCard";

// Dynamic imports for background components
const AmbientBackground = dynamic(() => import("@/components/AmbientBackground"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-gradient-to-br from-purple-900/20 to-blue-900/20 animate-pulse" />
  )
});

const BackgroundVideo = dynamic(() => import("@/components/BackgroundVideo"), {
  ssr: false,
  loading: () => (
    <div className="fixed top-0 left-0 w-full h-full -z-50 bg-gradient-to-br from-gray-900 to-black animate-pulse" />
  )
});

const BackgroundControls = dynamic(() => import("@/components/BackgroundControls"), {
  ssr: false,
  loading: () => null
});

// Sample projects data - you can move this to a separate file later
const projects = [
  {
    id: 1,
    title: "Portfolio Website",
    description: "A modern, responsive portfolio website built with Next.js featuring dynamic backgrounds and smooth animations.",
    technologies: ["Next.js", "React", "Tailwind CSS", "Framer Motion"],
    githubUrl: "https://github.com/jjola00/portfolio",
    liveUrl: "https://yourportfolio.com",
    image: "/projects/portfolio.jpg", // Add your project images to public/projects/
    featured: true
  },
  {
    id: 2,
    title: "Task Management App",
    description: "A full-stack task management application with real-time updates and collaborative features.",
    technologies: ["React", "Node.js", "MongoDB", "Socket.io"],
    githubUrl: "https://github.com/jjola00/task-app",
    liveUrl: "https://taskapp.com",
    image: "/projects/task-app.jpg",
    featured: false
  },
  {
    id: 3,
    title: "Weather Dashboard",
    description: "A responsive weather dashboard with location-based forecasts and interactive charts.",
    technologies: ["JavaScript", "Chart.js", "OpenWeather API", "CSS3"],
    githubUrl: "https://github.com/jjola00/weather-dashboard",
    liveUrl: "https://weather-dashboard.com",
    image: "/projects/weather.jpg",
    featured: false
  }
];

export default function Projects() {
  const { mode, ambientEffect } = useBackground();

  return (
    <>
      {/* Dynamic Background System */}
      {mode === 'ambient' ? (
        <AmbientBackground effect={ambientEffect} />
      ) : (
        <BackgroundVideo />
      )}

      {/* Background Controls */}
      <BackgroundControls />

      <article className="relative w-full flex flex-col items-center justify-center py-8 sm:py-0 space-y-8 min-h-screen">
        <div className="flex flex-col items-center justify-center space-y-6 w-full sm:w-3/4 max-w-6xl px-4">
          <h1 className="text-blue-200 font-semibold text-center text-4xl capitalize">
            My Projects
          </h1>
          <p className="text-center font-light text-sm xs:text-base max-w-2xl">
            Here are some of the projects I've worked on. Each one represents a unique challenge and learning experience.
          </p>
        </div>

        {/* Featured Projects */}
        <div className="w-full max-w-6xl px-4">
          <h2 className="text-2xl font-semibold text-blue-100 mb-6 text-center">Featured Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {projects.filter(project => project.featured).map((project) => (
              <ProjectCard key={project.id} project={project} featured={true} />
            ))}
          </div>

          {/* Other Projects */}
          <h2 className="text-2xl font-semibold text-blue-100 mb-6 text-center">Other Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.filter(project => !project.featured).map((project) => (
              <ProjectCard key={project.id} project={project} featured={false} />
            ))}
          </div>
        </div>
      </article>
    </>
  );
}