import { Technology, Project } from '../types';

export const mockTechnologies: Technology[] = [
  {
    id: '1',
    title: 'LangChain 0.3.0',
    description: 'Revolutionary framework for developing applications with large language models, featuring improved memory management and tool integration.',
    category: 'AI/ML',
    source: 'GitHub',
    tags: ['LLM', 'Framework', 'Python', 'JavaScript'],
    popularity: 95,
    dateAdded: '2024-01-15',
    useCases: ['Chatbots', 'Document Analysis', 'Code Generation', 'Content Creation'],
    complexity: 'Intermediate',
    githubStars: 87500,
    website: 'https://langchain.com'
  },
  {
    id: '2',
    title: 'Stable Video Diffusion',
    description: 'Text-to-video generation model that creates high-quality videos from simple text prompts with unprecedented realism.',
    category: 'AI/ML',
    source: 'Hugging Face',
    tags: ['Computer Vision', 'Video Generation', 'Diffusion Models'],
    popularity: 92,
    dateAdded: '2024-01-14',
    useCases: ['Marketing Videos', 'Animation', 'Social Media Content', 'Prototyping'],
    complexity: 'Advanced',
    githubStars: 45300,
  },
  {
    id: '3',
    title: 'Supabase Realtime v2',
    description: 'Enhanced real-time database with improved performance, WebSocket connections, and multi-tenant architecture.',
    category: 'DevTools',
    source: 'GitHub',
    tags: ['Database', 'Real-time', 'PostgreSQL', 'WebSocket'],
    popularity: 88,
    dateAdded: '2024-01-13',
    useCases: ['Live Chat', 'Collaborative Apps', 'Gaming', 'IoT Dashboards'],
    complexity: 'Beginner',
    githubStars: 65200,
    website: 'https://supabase.com'
  },
  {
    id: '4',
    title: 'Polkadot 2.0',
    description: 'Next-generation blockchain platform with enhanced interoperability, scalability, and governance mechanisms.',
    category: 'Web3',
    source: 'GitHub',
    tags: ['Blockchain', 'Interoperability', 'Rust', 'Smart Contracts'],
    popularity: 85,
    dateAdded: '2024-01-12',
    useCases: ['DeFi Applications', 'Cross-chain Bridges', 'DAOs', 'NFT Marketplaces'],
    complexity: 'Advanced',
    githubStars: 7100,
    website: 'https://polkadot.network'
  },
  {
    id: '5',
    title: 'React Native 0.74',
    description: 'Latest React Native with improved performance, new architecture, and enhanced developer experience.',
    category: 'Mobile',
    source: 'GitHub',
    tags: ['Mobile', 'React', 'JavaScript', 'Cross-platform'],
    popularity: 90,
    dateAdded: '2024-01-11',
    useCases: ['Mobile Apps', 'Cross-platform Development', 'Enterprise Apps'],
    complexity: 'Intermediate',
    githubStars: 116000,
    website: 'https://reactnative.dev'
  },
  {
    id: '6',
    title: 'Edge Runtime',
    description: 'Serverless computing platform optimized for edge deployment with ultra-low latency and global distribution.',
    category: 'Cloud',
    source: 'ProductHunt',
    tags: ['Serverless', 'Edge Computing', 'CDN', 'Performance'],
    popularity: 82,
    dateAdded: '2024-01-10',
    useCases: ['API Endpoints', 'Real-time Processing', 'Global Apps', 'CDN Functions'],
    complexity: 'Intermediate',
    githubStars: 23400,
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'AI Content Creator',
    description: 'Platform for generating marketing content using LangChain and GPT-4',
    technology: mockTechnologies[0],
    status: 'Development',
    progress: 65,
    createdAt: '2024-01-10',
    estimatedCompletion: '2024-02-15',
    techStack: ['React', 'Node.js', 'LangChain', 'PostgreSQL'],
    repository: 'https://github.com/user/ai-content-creator',
    userId: 'user1'
  },
  {
    id: '2',
    title: 'Video Generation Studio',
    description: 'Tool for creating marketing videos from text descriptions',
    technology: mockTechnologies[1],
    status: 'Planning',
    progress: 15,
    createdAt: '2024-01-12',
    estimatedCompletion: '2024-03-01',
    techStack: ['Python', 'FastAPI', 'Stable Diffusion', 'React'],
    userId: 'user1'
  }
];

// Removed mockInvestors array - investors will come from real-time Firestore data