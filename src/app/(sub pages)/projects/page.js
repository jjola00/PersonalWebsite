"use client";

import dynamic from "next/dynamic";
import { useBackground } from "@/components/BackgroundManager";
import ProjectCard from "@/components/projects/ProjectCard";
import { 
  getFeaturedProject, 
  getOtherProjects, 
  validateProject, 
  isProjectFeatured, 
  FEATURED_PROJECT_CONFIG 
} from "@/data/projects";

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

/**
 * Enhanced helper function to adapt project data for current ProjectCard component
 * Maps about section project data structure to ProjectCard expectations
 * Includes intelligent technology extraction and proper URL handling
 */
const adaptProjectForCard = (project) => {
  // Enhanced technology extraction based on project descriptions and titles
  const extractTechnologies = (description, projectTitle) => {
    const technologies = [];
    const desc = description.toLowerCase();
    const title = projectTitle.toLowerCase();
    
    // Comprehensive technology mapping with variations and common patterns
    const techMap = {
      'React': ['react', 'jsx'],
      'TypeScript': ['typescript', 'ts'],
      'JavaScript': ['javascript', 'js'],
      'Python': ['python', 'py'],
      'Java': ['java'],
      'C++': ['c++', 'cpp'],
      'Next.js': ['next.js', 'nextjs', 'next'],
      'Node.js': ['node.js', 'nodejs', 'node'],
      'MongoDB': ['mongodb', 'mongo'],
      'PostgreSQL': ['postgresql', 'postgres'],
      'Supabase': ['supabase'],
      'Flask': ['flask'],
      'PyTorch': ['pytorch', 'torch'],
      'Flutter': ['flutter'],
      'React Native': ['react native'],
      'Qt': ['qt'],
      'Maven': ['maven'],
      'Netlify': ['netlify'],
      'Tailwind CSS': ['tailwind'],
      'CSS': ['css'],
      'HTML': ['html'],
      'AI/ML': ['neural network', 'deep learning', 'machine learning', 'ai', 'ml', 'artificial intelligence'],
      'Database': ['database', 'db'],
      'Mobile': ['mobile', 'android', 'ios', 'cross-platform'],
      'Web': ['web', 'frontend', 'backend', 'full-stack'],
      'Game Dev': ['game', 'gui', 'adventure'],
      'Data Science': ['data', 'visualization', 'analysis'],
      'IoT': ['raspberry pi', 'bluetooth', 'iot'],
      'Algorithms': ['leetcode', 'algorithm', 'data structure'],
      'Testing': ['test', 'unit test', 'testing'],
      'Build Tools': ['build', 'script', 'deployment']
    };
    
    // Extract technologies based on keywords in description and title
    Object.entries(techMap).forEach(([tech, keywords]) => {
      if (keywords.some(keyword => desc.includes(keyword) || title.includes(keyword))) {
        technologies.push(tech);
      }
    });
    
    // Project-specific technology additions based on known projects and their contexts
    const projectSpecificTech = {
      'StableWise': ['React', 'TypeScript', 'Supabase', 'Netlify', 'AI/ML', 'Web'],
      'Aicoholics': ['Python', 'PyTorch', 'Flask', 'AI/ML', 'Data Science', 'Web'],
      'Ecosim': ['Java', 'Maven', 'Testing', 'Build Tools'],
      'Fuzzle': ['Flutter', 'React Native', 'Mobile', 'IoT', 'Testing'],
      'Zork': ['C++', 'Qt', 'Game Dev', 'Build Tools'],
      'Leet Code Adventures': ['Python', 'C++', 'Algorithms']
    };
    
    // Add project-specific technologies if not already included
    if (projectSpecificTech[projectTitle]) {
      projectSpecificTech[projectTitle].forEach(tech => {
        if (!technologies.includes(tech)) {
          technologies.push(tech);
        }
      });
    }
    
    // Remove duplicates and ensure we have meaningful technologies
    const uniqueTechnologies = [...new Set(technologies)];
    
    // If no technologies found, extract from status or use fallback
    if (uniqueTechnologies.length === 0) {
      if (project.status && project.status !== 'Unknown') {
        uniqueTechnologies.push(project.status);
      } else {
        uniqueTechnologies.push('Software');
      }
    }
    
    // Prioritize more specific technologies and limit to 6 most relevant
    const priorityOrder = ['React', 'TypeScript', 'Python', 'Java', 'C++', 'Flutter', 'AI/ML', 'Web', 'Mobile'];
    const sortedTechnologies = uniqueTechnologies.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a);
      const bIndex = priorityOrder.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
    
    return sortedTechnologies.slice(0, 6);
  };
  
  // Enhanced URL handling with better detection and fallback logic
  const processProjectLinks = (demoLink, projectTitle) => {
    if (!demoLink) {
      return { githubUrl: null, liveUrl: null };
    }
    
    const isGithubUrl = demoLink.includes('github.com');
    const isLiveUrl = demoLink.includes('http') && !isGithubUrl;
    
    // For projects that typically have both GitHub and live versions
    const projectsWithLiveVersions = ['StableWise'];
    const hasLiveVersion = projectsWithLiveVersions.includes(projectTitle);
    
    return {
      githubUrl: isGithubUrl ? demoLink : null,
      liveUrl: isLiveUrl || hasLiveVersion ? demoLink : null
    };
  };
  
  // Validate project data structure
  if (!project || typeof project !== 'object') {
    console.warn('Invalid project data: not an object', project);
    return null;
  }
  
  if (!project.title || !project.description) {
    console.warn('Invalid project data: missing required fields', project);
    return null;
  }
  
  // Process URLs and technologies
  const { githubUrl, liveUrl } = processProjectLinks(project.demoLink, project.title);
  const technologies = extractTechnologies(project.description || '', project.title || '');
  
  // Return adapted project object with all required properties for ProjectCard
  return {
    ...project,
    // Map imageUrl to image property expected by ProjectCard
    image: project.imageUrl || '/projects/placeholder.png',
    // Add extracted technologies array
    technologies: Array.isArray(technologies) ? technologies : [],
    // Add separated GitHub and live URLs
    githubUrl: githubUrl || null,
    liveUrl: liveUrl || null,
    // Mark StableWise as featured project
    featured: project.title === "StableWise"
  };
};

/**
 * Helper function to ensure project has all required properties for ProjectCard component
 * Provides fallbacks for missing properties and validates data types
 */
const ensureProjectProperties = (project) => {
  if (!project || typeof project !== 'object') {
    return null;
  }
  
  // Define required properties with fallbacks
  const requiredProperties = {
    id: project.id || Math.random(),
    title: project.title || 'Untitled Project',
    description: project.description || 'No description available',
    status: project.status || 'Unknown',
    image: project.image || project.imageUrl || '/projects/placeholder.png',
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    githubUrl: project.githubUrl || null,
    liveUrl: project.liveUrl || null,
    featured: Boolean(project.featured)
  };
  
  // Validate that essential properties exist
  if (!requiredProperties.title || !requiredProperties.description) {
    console.warn('Project missing essential properties:', project);
    return null;
  }
  
  return requiredProperties;
};

/**
 * Helper function to separate StableWise from other projects with validation
 */
const separateProjectsByFeatured = (projects) => {
  if (!Array.isArray(projects)) {
    console.warn('Projects is not an array:', projects);
    return { featured: null, others: [] };
  }
  
  const stableWise = projects.find(project => project && project.title === "StableWise");
  const others = projects.filter(project => project && project.title !== "StableWise");
  
  return {
    featured: stableWise || null,
    others: others || []
  };
};

export default function Projects() {
  const { mode, ambientEffect } = useBackground();
  
  // Get real project data using centralized data functions
  const featuredProject = getFeaturedProject();
  const otherProjects = getOtherProjects();
  
  // Enhanced project processing with comprehensive validation and adaptation
  const processProjects = () => {
    try {
      // Process featured project (StableWise)
      let processedFeatured = null;
      if (featuredProject) {
        // Validate using centralized validation
        if (validateProject(featuredProject)) {
          const adapted = adaptProjectForCard(featuredProject);
          processedFeatured = adapted ? ensureProjectProperties(adapted) : null;
        } else {
          console.warn('Featured project failed validation:', featuredProject);
        }
      }
      
      // Process other projects
      const processedOthers = otherProjects
        .filter(project => {
          if (!validateProject(project)) {
            console.warn('Project failed validation:', project?.title || 'Unknown');
            return false;
          }
          return true;
        })
        .map(project => {
          const adapted = adaptProjectForCard(project);
          return adapted ? ensureProjectProperties(adapted) : null;
        })
        .filter(project => project !== null);
      
      return {
        featured: processedFeatured,
        others: processedOthers
      };
    } catch (error) {
      console.error('Error processing projects:', error);
      return {
        featured: null,
        others: []
      };
    }
  };
  
  // Process all projects with error handling
  const { featured: adaptedFeaturedProject, others: adaptedOtherProjects } = processProjects();
  
  // Log processing results for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Projects processing results:', {
      featuredProject: adaptedFeaturedProject?.title || 'None',
      otherProjectsCount: adaptedOtherProjects.length,
      otherProjects: adaptedOtherProjects.map(p => p.title)
    });
  }

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
          <h2 className="text-2xl font-semibold text-blue-100 mb-6 text-center">Featured</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {adaptedFeaturedProject ? (
              <ProjectCard key={adaptedFeaturedProject.id} project={adaptedFeaturedProject} featured={true} />
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                <p>No featured project available</p>
              </div>
            )}
          </div>

          {/* Other Projects */}
          <h2 className="text-2xl font-semibold text-blue-100 mb-6 text-center">Other Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adaptedOtherProjects.length > 0 ? (
              adaptedOtherProjects.map((project) => (
                <ProjectCard key={project.id} project={project} featured={false} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">
                <p>No other projects available</p>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}