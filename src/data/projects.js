/**
 * Shared projects data for use across the application
 * This data structure matches the existing project object format from the about section
 * 
 * Project Object Structure:
 * {
 *   id: number,
 *   title: string,
 *   description: string,
 *   status: string, // "MVP" | "Completed" | "Ongoing" | "Pre-seed" | "On Hold" | "In Progress"
 *   imageUrl: string,
 *   demoLink: string
 * }
 */

export const projects = [
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

// Helper function to get featured project (StableWise)
export const getFeaturedProject = () => {
  return projects.find(project => project.title === "StableWise");
};

// Helper function to get all projects except the featured one
export const getOtherProjects = () => {
  return projects.filter(project => project.title !== "StableWise");
};

// Helper function to get all projects
export const getAllProjects = () => {
  return projects;
};

// Helper function to get projects by status
export const getProjectsByStatus = (status) => {
  return projects.filter(project => project.status.toLowerCase() === status.toLowerCase());
};

// Helper function to validate project data structure
export const validateProject = (project) => {
  const requiredFields = ['id', 'title', 'description', 'status', 'imageUrl', 'demoLink'];
  return requiredFields.every(field => project && project[field] !== undefined && project[field] !== null);
};

// Helper function to get project by ID
export const getProjectById = (id) => {
  return projects.find(project => project.id === id);
};