import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Star,
  MessageCircle,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Eye,
  Download,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InvestorConnection, Project } from '../types';
import { getInvestorConnections } from '../services/firestore';
import { useNavigate } from 'react-router-dom';

const InvestorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<InvestorConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<InvestorConnection | null>(null);
  const navigate = useNavigate();

  const statuses = ['All', 'pending', 'accepted', 'rejected'];

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For investors, we need to get connections where they are the target
      // This would require a different query structure in a real implementation
      const investorConnections = await getInvestorConnections(user.uid);
      setConnections(investorConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionAction = async (connectionId: string, action: 'accept' | 'reject', message?: string) => {
    // In a real implementation, this would update the connection status
    console.log(`${action} connection ${connectionId}`, message);
    
    // Update local state
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: action === 'accept' ? 'accepted' : 'rejected', responseMessage: message }
        : conn
    ));
  };

  const handleStartChat = (connection: InvestorConnection) => {
    // Navigate to chat with this developer
    navigate('/chat', { state: { connection } });
  };

  const filteredConnections = connections.filter(conn => {
    const matchesStatus = selectedStatus === 'All' || conn.status === selectedStatus;
    const matchesSearch = conn.projectData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conn.projectData.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      'accepted': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      'rejected': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': AlertCircle,
      'accepted': CheckCircle,
      'rejected': XCircle
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="w-4 h-4" />;
  };

  const stats = [
    {
      title: 'Total Requests',
      value: connections.length.toString(),
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Pending Review',
      value: connections.filter(c => c.status === 'pending').length.toString(),
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      change: '+5%'
    },
    {
      title: 'Accepted Projects',
      value: connections.filter(c => c.status === 'accepted').length.toString(),
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      change: '+25%'
    },
    {
      title: 'Active Chats',
      value: connections.filter(c => c.status === 'accepted').length.toString(),
      icon: MessageCircle,
      color: 'from-purple-500 to-pink-500',
      change: '+18%'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading investor dashboard...</p>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user?.name}! 💼
              </h1>
              <p className="text-xl opacity-90 mb-4">
                {user?.firm} • {user?.stage} Investor
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {user?.checkSize}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {user?.focus?.join(', ')}
                </div>
              </div>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full"></div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {stat.title}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>{filteredConnections.length} connection requests</span>
            </div>
          </div>
        </motion.div>

        {/* Connection Requests */}
        <div className="space-y-6">
          {filteredConnections.map((connection, index) => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {connection.projectData.title}
                      </h3>
                      <div className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(connection.status)}`}>
                        {getStatusIcon(connection.status)}
                        <span className="ml-1 capitalize">{connection.status}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {connection.projectData.description}
                    </p>
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {connection.projectData.progress}%
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Submitted</span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {new Date(connection.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MVP Doc</span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {connection.projectData.mvpDocument ? 'Available' : 'Not provided'}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Demo</span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white">
                      {connection.projectData.demo ? 'Available' : 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {connection.projectData.techStack.map(tech => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-md font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message from Developer</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                      {connection.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {connection.projectData.mvpDocument && (
                      <button className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                        <Download className="w-4 h-4 mr-1" />
                        Download MVP
                      </button>
                    )}
                    {connection.projectData.demo && (
                      <a
                        href={connection.projectData.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Demo
                      </a>
                    )}
                    {connection.projectData.repository && (
                      <a
                        href={connection.projectData.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Repository
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {connection.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConnectionAction(connection.id, 'reject')}
                          className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleConnectionAction(connection.id, 'accept')}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                        >
                          Accept & Start Chat
                        </button>
                      </>
                    )}
                    
                    {connection.status === 'accepted' && (
                      <button
                        onClick={() => handleStartChat(connection)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredConnections.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No connection requests</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedStatus === 'All' 
                ? "You haven't received any project connection requests yet."
                : `No ${selectedStatus} requests found.`
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InvestorDashboard;