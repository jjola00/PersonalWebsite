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
      className={`group relative overflow-hidden rounded-xl bg-black/30 backdrop-blur-sm border border-white/20 hover:border-blue-400/50 transition-all duration-300 ${
        featured ? 'lg:col-span-1' : ''
      }`}
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
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
          <div className="absolute top-4 left-4 px-3 py-1 bg-blue-500/80 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-md border border-blue-500/30"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3 pt-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 text-sm border border-gray-600/30 hover:border-gray-500/50"
            >
              <Github className="w-4 h-4" />
              Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 hover:text-blue-100 rounded-lg transition-all duration-200 text-sm border border-blue-500/30 hover:border-blue-400/50"
            >
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;