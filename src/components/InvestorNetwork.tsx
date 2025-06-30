import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Star,
  MapPin,
  ExternalLink,
  Users,
  TrendingUp,
  DollarSign,
  Building,
  Mail,
  Heart,
  Award,
  Loader,
  Send,
  X,
  CheckCircle,
  FileText,
  Code,
  Rocket,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Investor, Project, InvestorConnection } from '../types';
import { subscribeToInvestors, addInvestorConnection } from '../services/firestore';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const InvestorNetwork: React.FC = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedFocus, setSelectedFocus] = useState<string>('All');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  const location = useLocation();
  const { user } = useAuth();
  
  // Get selected project from navigation state
  const selectedProject: Project | undefined = location.state?.selectedProject;

  const stages = ['All', 'Pre-seed', 'Seed', 'Series A', 'Series B+'];
  const focusAreas = ['All', 'AI/ML', 'Web3', 'DevTools', 'Mobile', 'Enterprise Software', 'Fintech'];

  useEffect(() => {
    const unsubscribe = subscribeToInvestors(
      (investorList) => {
        setInvestors(investorList);
        setLoading(false);
      },
      {
        stage: selectedStage !== 'All' ? selectedStage : undefined,
        activelyInvesting: showActiveOnly ? true : undefined,
        limit: 50
      }
    );

    return () => unsubscribe();
  }, [selectedStage, showActiveOnly]);

  const handleConnectInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
    setConnectionMessage(generateDefaultMessage(investor, selectedProject));
    setShowConnectionModal(true);
  };

  const generateDefaultMessage = (investor: Investor, project?: Project): string => {
    if (!project) {
      return `Dear ${investor.name},

I hope this message finds you well. I'm reaching out because I believe there's a strong alignment between your investment focus and my current project.

I would love to discuss potential collaboration opportunities and share more details about my work.

Best regards,
${user?.name || 'Entrepreneur'}`;
    }

    return `Dear ${investor.name},

I hope this message finds you well. I'm reaching out because I believe there's a strong alignment between your investment focus at ${investor.firm} and my current project: ${project.title}.

**Project Overview:**
${project.description}

**Technology Stack:**
${project.techStack.join(', ')}

**Current Progress:** ${project.progress}% complete
**Status:** ${project.status}

**Why this aligns with your portfolio:**
Your focus on ${investor.focus.join(', ')} and investments in companies like ${investor.portfolio.slice(0, 2).join(' and ')} suggests this project would be a great fit for your investment thesis.

I would love to schedule a brief call to discuss this opportunity further and share our detailed MVP documentation and technical specifications.

Best regards,
${user?.name || 'Entrepreneur'}

---
Project Repository: ${project.repository || 'Available upon request'}
Demo: ${project.demo || 'Available upon request'}`;
  };

  const handleSendConnection = async () => {
    if (!selectedInvestor || !user || !selectedProject) return;

    setConnectionStatus('sending');

    try {
      const connection: Omit<InvestorConnection, 'id'> = {
        projectId: selectedProject.id,
        investorId: selectedInvestor.id,
        userId: user.uid,
        status: 'pending',
        message: connectionMessage,
        projectData: {
          title: selectedProject.title,
          description: selectedProject.description,
          techStack: selectedProject.techStack,
          progress: selectedProject.progress,
          mvpDocument: selectedProject.mvpDocument,
          demo: selectedProject.demo,
          repository: selectedProject.repository
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const connectionId = await addInvestorConnection(connection);
      
      if (connectionId) {
        setConnectionStatus('sent');
        
        // Reset after showing success
        setTimeout(() => {
          setShowConnectionModal(false);
          setSelectedInvestor(null);
          setConnectionMessage('');
          setConnectionStatus('idle');
        }, 2000);
      } else {
        setConnectionStatus('idle');
        alert('Failed to send connection request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending connection:', error);
      setConnectionStatus('idle');
      alert('Failed to send connection request. Please try again.');
    }
  };

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.firm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.focus.some(focus => focus.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFocus = selectedFocus === 'All' || investor.focus.includes(selectedFocus);
    
    return matchesSearch && matchesFocus;
  });

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'Pre-seed': 'from-blue-500 to-cyan-500',
      'Seed': 'from-green-500 to-emerald-500',
      'Series A': 'from-purple-500 to-pink-500',
      'Series B+': 'from-orange-500 to-red-500'
    };
    return colors[stage as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading investors...</p>
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
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Investor Connect Network
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Connect with matched investors based on your project's technology stack, 
            market vertical, and funding requirements.
          </motion.p>
          
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 max-w-2xl mx-auto"
            >
              <div className="flex items-center space-x-3">
                <Rocket className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <div className="text-left">
                  <h3 className="font-semibold text-primary-900 dark:text-primary-100">{selectedProject.title}</h3>
                  <p className="text-sm text-primary-700 dark:text-primary-300">Ready for investor connections</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search investors, firms, or focus areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Investment Stage</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Focus Area</label>
              <select
                value={selectedFocus}
                onChange={(e) => setSelectedFocus(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {focusAreas.map(focus => (
                  <option key={focus} value={focus}>{focus}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Investment Status</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-700 dark:text-gray-300">Actively Investing Only</span>
                <button
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    showActiveOnly ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      showActiveOnly ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>{filteredInvestors.length} investors match your criteria</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                AI-Matched
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-purple-500" />
                Top Rated
              </div>
            </div>
          </div>
        </motion.div>

        {/* Investor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors.map((investor, index) => (
            <motion.div
              key={investor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{investor.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{investor.firm}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(investor.matchScore)}`}>
                      {investor.matchScore}% Match
                    </div>
                    {investor.activelyInvesting && (
                      <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs rounded-full font-medium">
                        Active
                      </div>
                    )}
                  </div>
                </div>

                {/* Investment Stage */}
                <div className="mb-4">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getStageColor(investor.stage)}`}>
                    {investor.stage}
                  </div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{investor.checkSize}</span>
                </div>

                {/* Focus Areas */}
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Focus Areas</span>
                  <div className="flex flex-wrap gap-2">
                    {investor.focus.slice(0, 3).map(focus => (
                      <span
                        key={focus}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                      >
                        {focus}
                      </span>
                    ))}
                    {investor.focus.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">+{investor.focus.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {investor.location}
                </div>

                {/* Portfolio Highlights */}
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Portfolio Highlights</span>
                  <div className="flex flex-wrap gap-2">
                    {investor.portfolio.slice(0, 3).map(company => (
                      <span
                        key={company}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-md font-medium"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between space-x-3">
                  <motion.button
                    onClick={() => handleConnectInvestor(investor)}
                    disabled={!selectedProject}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Connect
                  </motion.button>
                  
                  <motion.button
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.a
                    href={investor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredInvestors.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No investors found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters.</p>
          </motion.div>
        )}

        {/* Connection Modal */}
        {showConnectionModal && selectedInvestor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Connect with {selectedInvestor.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{selectedInvestor.firm}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConnectionModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {connectionStatus === 'sent' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connection Request Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your message has been sent to {selectedInvestor.name}. They will review your project details and get back to you soon.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Project Summary */}
                    {selectedProject && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Project Details Being Shared</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Rocket className="w-4 h-4 text-primary-600 mr-2" />
                            <span className="font-medium">Project:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedProject.title}</span>
                          </div>
                          <div className="flex items-center">
                            <Code className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium">Tech Stack:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedProject.techStack.join(', ')}</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                            <span className="font-medium">Progress:</span>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedProject.progress}% complete</span>
                          </div>
                          {selectedProject.mvpDocument && (
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="font-medium">MVP Documentation:</span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">Included</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Message
                      </label>
                      <textarea
                        value={connectionMessage}
                        onChange={(e) => setConnectionMessage(e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Write your message to the investor..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => setShowConnectionModal(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendConnection}
                        disabled={!connectionMessage.trim() || connectionStatus === 'sending'}
                        className="flex items-center px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {connectionStatus === 'sending' ? (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        {connectionStatus === 'sending' ? 'Sending...' : 'Send Connection Request'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Matching Algorithm Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800"
        >
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">AI-Powered Matching</h3>
            <p className="text-primary-700 dark:text-primary-300 max-w-2xl mx-auto">
              Our algorithm analyzes your project's technology stack, market vertical, funding stage, 
              and team composition to find the most relevant investors for your startup.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvestorNetwork;