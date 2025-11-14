"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Code2 } from "lucide-react";
import Image from "next/image";

const ProjectCard = ({ project, featured = false }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`group relative overflow-hidden rounded-xl bg-black/30 backdrop-blur-sm border transition-all duration-300 ${
        featured 
          ? 'border-blue-400/50 hover:border-blue-400/70 shadow-2xl shadow-blue-500/20' 
          : 'border-white/20 hover:border-blue-400/50'
      }`}
    >
      {/* Project Image */}
      <div className={`relative overflow-hidden ${featured ? 'h-80 sm:h-96 lg:h-[500px]' : 'h-48'}`}>
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback gradient background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center ${
            project.image ? 'hidden' : 'flex'
          }`}
        >
          <Code2 className="w-12 h-12 text-blue-200/50" />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-4 left-4 px-4 py-2 bg-blue-500/90 backdrop-blur-sm rounded-full text-sm font-semibold text-white shadow-lg">
            ⭐ Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`space-y-4 ${featured ? 'p-8' : 'p-6'}`}>
        <div>
          <h3 className={`font-semibold text-white mb-3 group-hover:text-blue-200 transition-colors ${
            featured ? 'text-3xl sm:text-4xl' : 'text-xl'
          }`}>
            {project.title}
          </h3>
          <p className={`text-gray-300 leading-relaxed ${
            featured ? 'text-base sm:text-lg' : 'text-sm'
          }`}>
            {project.description}
          </p>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2">
          {project.technologies && project.technologies.length > 0 ? (
            project.technologies.map((tech, index) => (
              <span
                key={index}
                className={`bg-blue-500/20 text-blue-200 rounded-md border border-blue-500/30 ${
                  featured ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs'
                }`}
              >
                {tech}
              </span>
            ))
          ) : (
            <span className={`bg-gray-500/20 text-gray-400 rounded-md border border-gray-500/30 ${
              featured ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs'
            }`}>
              No technologies listed
            </span>
          )}
        </div>

        {/* Links */}
        <div className={`flex gap-3 ${featured ? 'pt-4' : 'pt-2'}`}>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 ${
                featured ? 'px-5 py-3 text-base' : 'px-3 py-2 text-sm'
              }`}
            >
              <Github className={featured ? 'w-5 h-5' : 'w-4 h-4'} />
              Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-blue-100 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-400/50 ${
                featured ? 'px-5 py-3 text-base font-medium' : 'px-3 py-2 text-sm'
              }`}
            >
              <ExternalLink className={featured ? 'w-5 h-5' : 'w-4 h-4'} />
              Live
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;