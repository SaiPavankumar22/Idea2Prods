export interface Technology {
  id: string;
  title: string;
  description: string;
  category: 'AI/ML' | 'Web3' | 'DevTools' | 'Mobile' | 'Cloud' | 'IoT';
  source: 'Hugging Face' | 'GitHub' | 'arXiv' | 'ProductHunt';
  tags: string[];
  popularity: number;
  dateAdded: string;
  useCases: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  githubStars?: number;
  website?: string;
  createdAt?: Date;
  userId?: string; // For user-created technologies
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'file' | 'folder';
  language?: string;
  size: number;
  lastModified: Date;
  parentId?: string;
}

export interface MVPDocument {
  id: string;
  projectId: string;
  title: string;
  content: string;
  sections: {
    overview: string;
    features: string[];
    techStack: string;
    architecture: string;
    timeline: string;
    resources: string;
  };
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface ProjectDetails {
  frontend: {
    framework: string;
    language: string;
    styling: string;
    stateManagement: string;
  };
  backend: {
    framework: string;
    language: string;
    runtime: string;
    api: string;
  };
  database: {
    type: string;
    name: string;
    orm?: string;
  };
  deployment: {
    hosting: string;
    ci_cd: string;
    domain?: string;
  };
  additional: {
    authentication: string;
    storage: string;
    monitoring: string;
    testing: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technology: Technology;
  status: 'Planning' | 'Development' | 'Testing' | 'Deployed';
  progress: number;
  createdAt: string;
  estimatedCompletion: string;
  techStack: string[];
  repository?: string;
  demo?: string;
  userId: string; // Owner of the project
  details?: ProjectDetails;
  files?: ProjectFile[];
  mvpDocument?: MVPDocument;
  isFinalized?: boolean;
}

export interface Investor {
  id: string;
  name: string;
  firm: string;
  focus: string[];
  stage: 'Pre-seed' | 'Seed' | 'Series A' | 'Series B+';
  checkSize: string;
  portfolio: string[];
  location: string;
  website: string;
  matchScore: number;
  createdAt?: Date;
}

export interface InvestorConnection {
  id: string;
  projectId: string;
  investorId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  mvpDocumentUrl?: string;
  projectData: {
    title: string;
    description: string;
    techStack: string[];
    progress: number;
    mvpDocument?: MVPDocument;
    demo?: string;
    repository?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  responseMessage?: string;
}

export interface ChatConversation {
  id: string;
  participants: string[]; // User IDs
  participantDetails: {
    [userId: string]: {
      name: string;
      role: 'developer' | 'investor';
      avatar?: string;
    };
  };
  projectId?: string;
  lastMessage?: ChatMessageInvestor;
  lastActivity: Date;
  isActive: boolean;
}

export interface ChatMessageInvestor {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'project_update';
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  isRead: boolean;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'developer' | 'investor';
  experience?: 'Beginner' | 'Intermediate' | 'Expert';
  interests?: string[];
  // Developer specific fields
  projects?: Project[];
  // Investor specific fields
  firm?: string;
  focus?: string[];
  stage?: string;
  checkSize?: string;
  portfolio?: string[];
  location?: string;
  website?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  userId: string;
  projectId?: string;
}