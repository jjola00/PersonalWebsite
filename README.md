# Personal Portfolio

Welcome to my personal portfolio! This project showcases my work as a software developer, featuring my projects, experience, and interests.

## About Me

I'm a software developer with experience across full-stack engineering and early-stage product building. I've worked with technologies like React, TypeScript, Node.js, Java, and Python, building everything from multiplayer web apps to AI-driven tools.

## Features

- **Dynamic Background System**: Toggle between ambient effects and video backgrounds
- **Project Showcase**: Featured and categorized project displays with detailed information
- **Interactive Animations**: Smooth animations and transitions using Framer Motion
- **Music & Movie Integration**: Personal music and movie sections with Spotify and Letterboxd integration
- **Responsive Design**: Fully optimized for all screen sizes and devices
- **Performance Optimized**: Bundle size monitoring, lazy loading, and web vitals tracking
- **Contact Form**: Integrated contact form using EmailJS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Lucide React icons
- **Forms**: React Hook Form
- **Email**: EmailJS
- **Performance**: Web Vitals, Bundle Analyzer

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/jjola00/PersonalWebsite.git
    cd PersonalWebsite
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env.local` file based on `.env.example` and add your API keys:
    - EmailJS credentials
    - Spotify API credentials
    - Letterboxd RSS feed URL
    - GitHub stats URL

4. **Run the development server**:
    ```bash
    npm run dev
    ```

5. **Open your browser** and navigate to `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:monitor` - Build with performance monitoring
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size
- `npm run check-bundle` - Check bundle size limits

## Project Structure

```
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── data/            # Project and configuration data
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   └── utils/           # Utility functions
├── public/              # Static assets
└── scripts/             # Build and monitoring scripts
```

## Contact

Feel free to reach out!

- **GitHub**: [jjola00](https://github.com/jjola00)
- **LinkedIn**: [Jay Jay Olajitan](https://www.linkedin.com/in/jay-jay-olajitan/)