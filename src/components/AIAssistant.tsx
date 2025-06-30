import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  Code,
  Rocket,
  Target,
  Brain,
  Sparkles,
  Plus,
  FolderPlus,
  FileText,
  Download
} from 'lucide-react';
import { Technology, ChatMessage, MVPDocument } from '../types';
import { getChatMessages, addChatMessage, addProject, updateProject } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIAssistantProps {
  selectedTech?: Technology;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ selectedTech: propSelectedTech }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showDraftMVP, setShowDraftMVP] = useState(false);
  const [mvpDocument, setMvpDocument] = useState<MVPDocument | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get selected tech and project context from props or location state
  const selectedTech = propSelectedTech || location.state?.selectedTech;
  const projectId = location.state?.projectId;
  const projectContext = location.state?.projectContext;

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user, projectId]);

  useEffect(() => {
    // Add initial message when tech is selected or project context is provided
    if (selectedTech && user) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: projectContext 
          ? `Welcome back! I see you want to continue developing your project with ${selectedTech.title}. I have our previous conversation history loaded. What would you like to work on next?`
          : `I see you're interested in ${selectedTech.title}! This is an exciting ${selectedTech.category} technology. Let me help you brainstorm project ideas and create a comprehensive development plan. What kind of product are you thinking of building?`,
        timestamp: new Date(),
        suggestions: projectContext 
          ? [
            'Review our previous discussion',
            'Plan next development phase',
            'Draft MVP documentation',
            'Update project requirements'
          ]
          : [
            `Create a ${selectedTech.category} SaaS platform`,
            'Build a mobile app',
            'Develop an enterprise solution',
            'Make a developer tool',
            'Create a project with this tech'
          ]
      };
      setMessages([initialMessage]);
    } else if (!selectedTech && !projectContext) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'assistant',
        content: "Hello! I'm your AI development assistant. I can help you brainstorm project ideas, choose the right tech stack, define your MVP scope, and create detailed development blueprints. What would you like to build today?",
        timestamp: new Date(),
        suggestions: [
          'I want to build a web app',
          'Show me trending project ideas',
          'Help me choose technologies',
          'Create a mobile app'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [selectedTech, user, projectContext]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const chatHistory = await getChatMessages(user.uid, projectId);
      const formattedMessages: Message[] = chatHistory.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp,
        suggestions: msg.suggestions
      }));
      
      if (formattedMessages.length > 0 && projectContext) {
        // Load existing chat history for project
        setMessages(formattedMessages);
      } else if (formattedMessages.length === 0 && !selectedTech && !projectContext) {
        // Add welcome message if no history
        const welcomeMessage: Message = {
          id: '1',
          type: 'assistant',
          content: "Hello! I'm your AI development assistant. I can help you brainstorm project ideas, choose the right tech stack, define your MVP scope, and create detailed development blueprints. What would you like to build today?",
          timestamp: new Date(),
          suggestions: [
            'I want to build a web app',
            'Show me trending project ideas',
            'Help me choose technologies',
            'Create a mobile app'
          ]
        };
        setMessages([welcomeMessage]);
      } else if (!selectedTech && !projectContext) {
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Save user message to Firestore
    try {
      await addChatMessage({
        type: 'user',
        content,
        timestamp: new Date(),
        userId: user.uid,
        projectId: projectId
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    // Check if user wants to create a project or draft MVP
    if (content.toLowerCase().includes('create a project') || content.toLowerCase().includes('start a project')) {
      setShowCreateProject(true);
    }
    
    if (content.toLowerCase().includes('draft mvp') || content.toLowerCase().includes('mvp document')) {
      setShowDraftMVP(true);
    }

    // Simulate AI response
    setTimeout(async () => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content, selectedTech, projectContext),
        timestamp: new Date(),
        suggestions: generateSuggestions(content, projectContext)
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Save assistant message to Firestore
      try {
        await addChatMessage({
          type: 'assistant',
          content: assistantMessage.content,
          timestamp: new Date(),
          suggestions: assistantMessage.suggestions,
          userId: user.uid,
          projectId: projectId
        });
      } catch (error) {
        console.error('Error saving assistant message:', error);
      }
    }, 2000);
  };

  const handleCreateProject = async () => {
    if (!selectedTech || !user) return;

    const projectTitle = `${selectedTech.title} Project`;
    const projectDescription = `A new project built with ${selectedTech.title} - ${selectedTech.description}`;

    try {
      const projectId = await addProject({
        title: projectTitle,
        description: projectDescription,
        technology: selectedTech,
        status: 'Planning',
        progress: 0,
        createdAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        techStack: [selectedTech.title, 'React', 'Node.js'],
        userId: user.uid
      });

      if (projectId) {
        // Add success message
        const successMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `🎉 Great! I've created a new project "${projectTitle}" for you. The project is now in your Project Hub where you can track progress, manage development, and deploy when ready. Would you like me to help you plan the development roadmap?`,
          timestamp: new Date(),
          suggestions: [
            'Plan development roadmap',
            'Define MVP features',
            'Choose tech stack',
            'Go to Project Hub'
          ]
        };
        
        setMessages(prev => [...prev, successMessage]);
        setShowCreateProject(false);

        // Save success message
        await addChatMessage({
          type: 'assistant',
          content: successMessage.content,
          timestamp: new Date(),
          suggestions: successMessage.suggestions,
          userId: user.uid,
          projectId: projectId
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDraftMVP = async () => {
    if (!user) return;

    // Generate MVP document based on conversation
    const conversationSummary = messages
      .filter(msg => msg.type === 'user')
      .map(msg => msg.content)
      .join(' ');

    const mvpDoc: MVPDocument = {
      id: Date.now().toString(),
      projectId: projectId || 'temp',
      title: `MVP Documentation - ${selectedTech?.title || 'Project'}`,
      content: generateMVPContent(conversationSummary, selectedTech),
      sections: {
        overview: `This MVP focuses on building a ${selectedTech?.category || 'technology'} solution using ${selectedTech?.title || 'modern technologies'}.`,
        features: [
          'User authentication and onboarding',
          'Core functionality implementation',
          'Dashboard and analytics',
          'Mobile-responsive design',
          'API integration'
        ],
        techStack: `Frontend: React with TypeScript, Backend: Node.js, Database: PostgreSQL, Deployment: Vercel`,
        architecture: 'Microservices architecture with RESTful APIs and real-time updates',
        timeline: '8-12 weeks development cycle with weekly sprints',
        resources: 'Development team of 2-3 developers, UI/UX designer, and project manager'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0'
    };

    setMvpDocument(mvpDoc);
    setShowDraftMVP(false);

    // Add success message
    const successMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `📋 Perfect! I've drafted a comprehensive MVP document based on our discussion. The document includes project overview, feature specifications, technical architecture, and development timeline. You can review and download it now.`,
      timestamp: new Date(),
      suggestions: [
        'Review MVP document',
        'Download documentation',
        'Modify requirements',
        'Finalize project details'
      ]
    };
    
    setMessages(prev => [...prev, successMessage]);

    // Save to project if projectId exists
    if (projectId) {
      try {
        await updateProject(projectId, { mvpDocument: mvpDoc });
      } catch (error) {
        console.error('Error saving MVP document:', error);
      }
    }
  };

  const handleDownloadMVP = () => {
    if (!mvpDocument) return;

    const content = `# ${mvpDocument.title}

## Project Overview
${mvpDocument.sections.overview}

## Core Features
${mvpDocument.sections.features.map(feature => `- ${feature}`).join('\n')}

## Technical Stack
${mvpDocument.sections.techStack}

## Architecture
${mvpDocument.sections.architecture}

## Development Timeline
${mvpDocument.sections.timeline}

## Required Resources
${mvpDocument.sections.resources}

## Detailed Content
${mvpDocument.content}

---
Generated on: ${new Date().toLocaleDateString()}
Version: ${mvpDocument.version}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mvpDocument.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMVPContent = (conversation: string, tech?: Technology): string => {
    return `# MVP Development Plan

## Executive Summary
This document outlines the Minimum Viable Product (MVP) development plan for a ${tech?.category || 'technology'} solution leveraging ${tech?.title || 'modern technologies'}.

## Problem Statement
Based on our discussion, we identified key market opportunities in the ${tech?.category || 'technology'} space that can be addressed through innovative product development.

## Solution Overview
Our MVP will focus on delivering core functionality that solves the primary user pain points while demonstrating the potential of ${tech?.title || 'the selected technology'}.

## Target Market
- Primary users: Early adopters in the ${tech?.category || 'technology'} space
- Market size: Growing demand for innovative solutions
- User personas: Tech-savvy professionals and businesses

## Core Features (MVP Scope)
1. **User Management**: Registration, authentication, and profile management
2. **Core Functionality**: Primary feature set leveraging ${tech?.title || 'selected technology'}
3. **Dashboard**: User interface for monitoring and management
4. **Basic Analytics**: Essential metrics and reporting
5. **Mobile Support**: Responsive design for mobile devices

## Technical Architecture
- **Frontend**: React with TypeScript for type safety and maintainability
- **Backend**: Node.js with Express for scalable API development
- **Database**: PostgreSQL for reliable data storage
- **Authentication**: JWT-based authentication system
- **Deployment**: Cloud-based deployment with CI/CD pipeline

## Development Phases
### Phase 1 (Weeks 1-3): Foundation
- Project setup and architecture
- User authentication system
- Basic UI/UX implementation

### Phase 2 (Weeks 4-6): Core Features
- Primary functionality development
- Database integration
- API development

### Phase 3 (Weeks 7-8): Polish & Deploy
- Testing and bug fixes
- Performance optimization
- Production deployment

## Success Metrics
- User acquisition rate
- Feature adoption
- Performance benchmarks
- User feedback scores

## Risk Assessment
- Technical challenges with ${tech?.title || 'selected technology'}
- Market competition
- Resource constraints
- Timeline dependencies

## Next Steps
1. Finalize technical specifications
2. Set up development environment
3. Begin Phase 1 development
4. Establish testing protocols

This MVP plan provides a solid foundation for building a successful product while maintaining focus on core value delivery.`;
  };

  const generateAIResponse = (userInput: string, tech?: Technology, isProjectContext?: boolean): string => {
    if (isProjectContext) {
      const responses = [
        `Great to continue our work on the ${tech?.title || 'project'}! Based on our previous discussions, I can see we've made good progress. Let me help you with the next phase of development.

**Current Status Review:**
• Project foundation is established
• Core requirements have been defined
• Technical stack decisions are in place

**Next Development Steps:**
• Implement core features
• Set up testing framework
• Prepare for deployment
• Document API specifications

What specific aspect would you like to focus on next?`,

        `Welcome back! I can see we're continuing development on your ${tech?.title || 'project'} project. Let me help you move forward with the implementation.

**Development Priorities:**
• Complete remaining core features
• Implement user feedback from testing
• Optimize performance and scalability
• Prepare production deployment

**Available Actions:**
• Draft comprehensive MVP documentation
• Plan next sprint activities
• Review technical architecture
• Connect with potential investors

Which area needs your attention first?`,

        `Excellent! Let's continue building your ${tech?.title || 'project'} solution. I have our conversation history and can help you progress to the next milestone.

**Project Momentum:**
• Strong technical foundation established
• Clear product vision defined
• Development roadmap in progress

**Immediate Opportunities:**
• Finalize MVP documentation
• Complete project technical details
• Prepare for investor presentations
• Plan user testing strategy

What would you like to tackle in this session?`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    }

    const responses = [
      `Great idea! Based on your interest in ${tech?.title || 'this technology'}, I can see several exciting possibilities. Let me break down a potential MVP approach:

**Core Features:**
• User authentication and onboarding
• Main functionality leveraging ${tech?.category || 'the selected tech'}
• Dashboard for user management
• Basic analytics and reporting

**Technical Stack Recommendation:**
• Frontend: React with TypeScript
• Backend: Node.js with Express
• Database: PostgreSQL for structured data
• Deployment: Vercel or AWS

Would you like me to dive deeper into any of these areas or explore different platform options?`,

      `Excellent choice! This type of project has strong market potential. Here's how we can structure your development approach:

**Phase 1 - MVP (2-4 weeks):**
• Core user flow implementation
• Basic UI/UX with essential features
• User feedback collection system

**Phase 2 - Enhancement (4-6 weeks):**
• Advanced features and integrations
• Performance optimization
• Mobile responsiveness

**Phase 3 - Scale (6-8 weeks):**
• Advanced analytics
• Enterprise features
• API development

What specific features are most important for your target users?`,

      `I love the direction you're thinking! Let's refine this concept further:

**Market Opportunity:**
This aligns well with current trends in ${tech?.category || 'the tech space'}. The target market shows strong demand for solutions that solve [specific problem].

**Unique Value Proposition:**
Your app could differentiate by focusing on [specific angle] while leveraging ${tech?.title || 'cutting-edge technology'}.

**Go-to-Market Strategy:**
• Start with a specific user segment
• Build in public to generate buzz
• Focus on solving one core problem extremely well

Should we explore the technical architecture or dive into business model considerations?`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateSuggestions = (userInput: string, isProjectContext?: boolean): string[] => {
    if (isProjectContext) {
      return [
        'Draft MVP documentation',
        'Plan next development phase',
        'Review technical architecture',
        'Prepare for investor pitch',
        'Set up testing strategy',
        'Finalize project details'
      ];
    }

    const suggestions = [
      'Tell me more about the technical architecture',
      'What should my MVP features be?',
      'Help me create a development timeline',
      'How do I validate this idea?',
      'What are the potential challenges?',
      'Create a project with this technology'
    ];
    
    return suggestions.slice(0, 4);
  };

  const quickActions = [
    { icon: Lightbulb, text: 'Project Ideas', color: 'from-yellow-500 to-orange-500' },
    { icon: Code, text: 'Tech Stack', color: 'from-blue-500 to-cyan-500' },
    { icon: Target, text: 'MVP Scope', color: 'from-green-500 to-emerald-500' },
    { icon: Rocket, text: 'Launch Plan', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4"
          >
            <Brain className="w-4 h-4 mr-2" />
            AI Development Assistant
            {projectContext && <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">Project Mode</span>}
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Turn Ideas into Reality
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            Get intelligent guidance from ideation to deployment
          </motion.p>
        </div>

        {/* Quick Actions */}
        {!projectContext && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.text}
                onClick={() => handleSendMessage(`Help me with ${action.text.toLowerCase()}`)}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">{action.text}</span>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* MVP Document Display */}
        {mvpDocument && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{mvpDocument.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Version {mvpDocument.version} • {new Date(mvpDocument.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={handleDownloadMVP}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Document Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Features:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{mvpDocument.sections.features.length} core features</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{mvpDocument.sections.timeline}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-br from-accent-400 to-accent-600' 
                      : 'bg-gradient-to-br from-primary-500 to-secondary-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.type === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick responses:</p>
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion)}
                            className="block w-full text-left px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-500 hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                placeholder="Describe your project idea or ask for guidance..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <motion.button
                onClick={() => handleSendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {showDraftMVP && (
            <motion.button
              onClick={handleDraftMVP}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-5 h-5 mr-2" />
              Draft MVP Document
            </motion.button>
          )}
          
          {showCreateProject && selectedTech && (
            <motion.button
              onClick={handleCreateProject}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Project
            </motion.button>
          )}
        </div>

        {/* Tech Context */}
        {selectedTech && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="text-primary-800 dark:text-primary-200 font-medium">
                  {projectContext ? 'Project Context:' : 'Currently exploring:'} {selectedTech.title}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setShowDraftMVP(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Draft MVP
                </motion.button>
                
                {!projectContext && (
                  <motion.button
                    onClick={() => setShowCreateProject(true)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Create Project
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;