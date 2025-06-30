import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  FolderOpen,
  GitBranch,
  ExternalLink,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Settings,
  Share,
  Loader,
  MessageSquare,
  FileText,
  Code,
  Users,
  Download,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Project, ProjectDetails, MVPDocument } from '../types';
import { getProjects, updateProject } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProjectHub: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'files' | 'mvp' | 'details'>('overview');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingDetails, setEditingDetails] = useState<ProjectDetails | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userProjects = await getProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueDevelopment = (project: Project) => {
    // Navigate to AI Assistant with project context
    navigate('/assistant', { 
      state: { 
        selectedTech: project.technology,
        projectId: project.id,
        projectContext: true
      } 
    });
  };

  const handleConnectInvestor = (project: Project) => {
    // Navigate to investor network with project selected
    navigate('/investors', { 
      state: { 
        selectedProject: project 
      } 
    });
  };

  const handleSaveDetails = async () => {
    if (!selectedProject || !editingDetails) return;

    try {
      const success = await updateProject(selectedProject.id, {
        details: editingDetails,
        isFinalized: true
      });

      if (success) {
        setSelectedProject({
          ...selectedProject,
          details: editingDetails,
          isFinalized: true
        });
        setProjects(projects.map(p => 
          p.id === selectedProject.id 
            ? { ...p, details: editingDetails, isFinalized: true }
            : p
        ));
        setShowDetailsModal(false);
        setEditingDetails(null);
      }
    } catch (error) {
      console.error('Error saving project details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Planning': 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      'Development': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      'Testing': 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
      'Deployed': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'Planning': AlertCircle,
      'Development': Play,
      'Testing': Settings,
      'Deployed': CheckCircle
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const renderProjectDetails = () => {
    if (!selectedProject) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Technology Used</h4>
              <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <h5 className="font-medium text-primary-900 dark:text-primary-100 mb-1">{selectedProject.technology.title}</h5>
                <p className="text-sm text-primary-700 dark:text-primary-300">{selectedProject.technology.description}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full text-white bg-gradient-to-r ${
                    selectedProject.technology.category === 'AI/ML' ? 'from-purple-500 to-pink-500' :
                    selectedProject.technology.category === 'Web3' ? 'from-blue-500 to-cyan-500' :
                    selectedProject.technology.category === 'DevTools' ? 'from-green-500 to-emerald-500' :
                    'from-gray-500 to-gray-600'
                  }`}>
                    {selectedProject.technology.category}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Progress Metrics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedProject.progress}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Days Active</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.ceil((new Date().getTime() - new Date(selectedProject.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Est. Completion</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.ceil((new Date(selectedProject.estimatedCompletion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            </div>

            {selectedProject.isFinalized && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Project Status</h4>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Project Finalized</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    All project details have been completed and the project is ready for investor connections.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'files':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Project Files</h4>
              <button className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                <Plus className="w-4 h-4 mr-1" />
                Add File
              </button>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Code className="w-4 h-4 mr-2" />
                  <span>src/</span>
                </div>
              </div>
              
              <div className="p-4 space-y-2">
                {['App.tsx', 'index.ts', 'components/', 'utils/', 'types.ts'].map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-white">{file}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">2 hours ago</span>
                      <button className="text-gray-400 hover:text-primary-600">
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
              File management system coming soon. Upload and manage your project files directly in the platform.
            </div>
          </div>
        );

      case 'mvp':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">MVP Documentation</h4>
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  <FileText className="w-4 h-4 mr-1" />
                  Draft MVP
                </button>
                {selectedProject.mvpDocument && (
                  <button className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                )}
              </div>
            </div>
            
            {selectedProject.mvpDocument ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">{selectedProject.mvpDocument.title}</h5>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Version {selectedProject.mvpDocument.version} • Last updated {new Date(selectedProject.mvpDocument.updatedAt).toLocaleDateString()}
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm">{selectedProject.mvpDocument.content.substring(0, 500)}...</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  No MVP documentation yet. Continue chatting with AI to generate comprehensive documentation.
                </p>
                <button 
                  onClick={() => handleContinueDevelopment(selectedProject)}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Continue with AI
                </button>
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Project Details</h4>
              <button 
                onClick={() => {
                  setEditingDetails(selectedProject.details || {
                    frontend: { framework: '', language: '', styling: '', stateManagement: '' },
                    backend: { framework: '', language: '', runtime: '', api: '' },
                    database: { type: '', name: '', orm: '' },
                    deployment: { hosting: '', ci_cd: '', domain: '' },
                    additional: { authentication: '', storage: '', monitoring: '', testing: '' }
                  });
                  setShowDetailsModal(true);
                }}
                className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-1" />
                {selectedProject.details ? 'Edit Details' : 'Add Details'}
              </button>
            </div>
            
            {selectedProject.details ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Frontend</h5>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-500">Framework:</span> {selectedProject.details.frontend.framework}</div>
                      <div><span className="text-gray-500">Language:</span> {selectedProject.details.frontend.language}</div>
                      <div><span className="text-gray-500">Styling:</span> {selectedProject.details.frontend.styling}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Backend</h5>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-500">Framework:</span> {selectedProject.details.backend.framework}</div>
                      <div><span className="text-gray-500">Language:</span> {selectedProject.details.backend.language}</div>
                      <div><span className="text-gray-500">Runtime:</span> {selectedProject.details.backend.runtime}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Database</h5>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-500">Type:</span> {selectedProject.details.database.type}</div>
                      <div><span className="text-gray-500">Name:</span> {selectedProject.details.database.name}</div>
                      {selectedProject.details.database.orm && (
                        <div><span className="text-gray-500">ORM:</span> {selectedProject.details.database.orm}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Deployment</h5>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-500">Hosting:</span> {selectedProject.details.deployment.hosting}</div>
                      <div><span className="text-gray-500">CI/CD:</span> {selectedProject.details.deployment.ci_cd}</div>
                      {selectedProject.details.deployment.domain && (
                        <div><span className="text-gray-500">Domain:</span> {selectedProject.details.deployment.domain}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  No project details configured yet. Add technical specifications to finalize your project.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Project Management Hub
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300"
            >
              Track progress, manage repositories, and deploy demos
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </motion.button>
        </div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start by discovering technologies and creating your first project.</p>
            <motion.button
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Project
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Projects List */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedProject(project)}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                      selectedProject?.id === project.id 
                        ? 'border-primary-300 ring-2 ring-primary-100 dark:border-primary-600 dark:ring-primary-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{project.description}</p>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1">{project.status}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${project.progress}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Tech Stack</span>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack.map(tech => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 mb-4">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinueDevelopment(project);
                          }}
                          className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Continue Development
                        </motion.button>
                        
                        {project.isFinalized && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnectInvestor(project);
                            }}
                            className="flex items-center px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Connect Investor
                          </motion.button>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Due {new Date(project.estimatedCompletion).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {project.repository && (
                            <a
                              href={project.repository}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GitBranch className="w-4 h-4" />
                            </a>
                          )}
                          {project.demo && (
                            <a
                              href={project.demo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Project Details Sidebar */}
            <div className="lg:col-span-1">
              {selectedProject ? (
                <motion.div
                  key={selectedProject.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-8"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{selectedProject.title}</h3>
                    
                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'files', label: 'Files', icon: Code },
                        { id: 'mvp', label: 'MVP', icon: FileText },
                        { id: 'details', label: 'Details', icon: Settings }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                          }`}
                        >
                          <tab.icon className="w-3 h-3 mr-1" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {renderProjectDetails()}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 text-center"
                >
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a Project</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a project from the list to view details and manage progress.</p>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {showDetailsModal && editingDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Frontend */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Frontend</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Framework</label>
                      <input
                        type="text"
                        value={editingDetails.frontend.framework}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          frontend: { ...editingDetails.frontend, framework: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., React, Vue, Angular"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                      <input
                        type="text"
                        value={editingDetails.frontend.language}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          frontend: { ...editingDetails.frontend, language: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., TypeScript, JavaScript"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Styling</label>
                      <input
                        type="text"
                        value={editingDetails.frontend.styling}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          frontend: { ...editingDetails.frontend, styling: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Tailwind CSS, Styled Components"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State Management</label>
                      <input
                        type="text"
                        value={editingDetails.frontend.stateManagement}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          frontend: { ...editingDetails.frontend, stateManagement: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Redux, Zustand, Context API"
                      />
                    </div>
                  </div>
                </div>

                {/* Backend */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backend</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Framework</label>
                      <input
                        type="text"
                        value={editingDetails.backend.framework}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          backend: { ...editingDetails.backend, framework: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Express, FastAPI, Django"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                      <input
                        type="text"
                        value={editingDetails.backend.language}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          backend: { ...editingDetails.backend, language: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Node.js, Python, Go"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Runtime</label>
                      <input
                        type="text"
                        value={editingDetails.backend.runtime}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          backend: { ...editingDetails.backend, runtime: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Node.js, Python 3.9, Go 1.19"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API</label>
                      <input
                        type="text"
                        value={editingDetails.backend.api}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          backend: { ...editingDetails.backend, api: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., REST, GraphQL, gRPC"
                      />
                    </div>
                  </div>
                </div>

                {/* Database */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Database</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                      <input
                        type="text"
                        value={editingDetails.database.type}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          database: { ...editingDetails.database, type: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., PostgreSQL, MongoDB, MySQL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={editingDetails.database.name}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          database: { ...editingDetails.database, name: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Database name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ORM (Optional)</label>
                      <input
                        type="text"
                        value={editingDetails.database.orm || ''}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          database: { ...editingDetails.database, orm: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Prisma, Sequelize, Mongoose"
                      />
                    </div>
                  </div>
                </div>

                {/* Deployment */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Deployment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hosting</label>
                      <input
                        type="text"
                        value={editingDetails.deployment.hosting}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          deployment: { ...editingDetails.deployment, hosting: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Vercel, Netlify, AWS"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CI/CD</label>
                      <input
                        type="text"
                        value={editingDetails.deployment.ci_cd}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          deployment: { ...editingDetails.deployment, ci_cd: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., GitHub Actions, GitLab CI"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain (Optional)</label>
                      <input
                        type="text"
                        value={editingDetails.deployment.domain || ''}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          deployment: { ...editingDetails.deployment, domain: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., myapp.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Services</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authentication</label>
                      <input
                        type="text"
                        value={editingDetails.additional.authentication}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          additional: { ...editingDetails.additional, authentication: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Firebase Auth, Auth0, JWT"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage</label>
                      <input
                        type="text"
                        value={editingDetails.additional.storage}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          additional: { ...editingDetails.additional, storage: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., AWS S3, Cloudinary, Firebase Storage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monitoring</label>
                      <input
                        type="text"
                        value={editingDetails.additional.monitoring}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          additional: { ...editingDetails.additional, monitoring: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Sentry, LogRocket, DataDog"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Testing</label>
                      <input
                        type="text"
                        value={editingDetails.additional.testing}
                        onChange={(e) => setEditingDetails({
                          ...editingDetails,
                          additional: { ...editingDetails.additional, testing: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Jest, Cypress, Playwright"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDetails}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHub;