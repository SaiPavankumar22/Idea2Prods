import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Rocket,
  Brain,
  Code,
  Zap,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Plus,
  Activity,
  Target,
  Award,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProjects } from '../services/firestore';
import { Project } from '../types';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProjects();
    }
  }, [user]);

  const loadUserProjects = async () => {
    if (!user) return;
    
    try {
      const userProjects = await getProjects(user.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    {
      title: 'Total Projects',
      value: projects.length.toString(),
      icon: Rocket,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'In Development',
      value: projects.filter(p => p.status === 'Development').length.toString(),
      icon: Code,
      color: 'from-green-500 to-emerald-500',
      change: '+8%'
    },
    {
      title: 'Completed',
      value: projects.filter(p => p.status === 'Deployed').length.toString(),
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      change: '+25%'
    },
    {
      title: 'Success Rate',
      value: projects.length > 0 ? Math.round((projects.filter(p => p.status === 'Deployed').length / projects.length) * 100) + '%' : '0%',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      change: '+15%'
    }
  ];

  const features = [
    {
      title: 'Tech Discovery',
      description: 'Explore cutting-edge technologies from GitHub, Hugging Face, and more',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      link: '/discover'
    },
    {
      title: 'AI Assistant',
      description: 'Get intelligent guidance from ideation to deployment',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      link: '/assistant'
    },
    {
      title: 'Project Hub',
      description: 'Manage your projects, track progress, and deploy demos',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      link: '/projects'
    },
    {
      title: 'Investor Network',
      description: 'Connect with matched investors for your projects',
      icon: Users,
      color: 'from-orange-500 to-red-500',
      link: '/investors'
    }
  ];

  const recentProjects = projects.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-xl opacity-90 mb-6">
                Welcome to your Idea2Prod dashboard. Ready to build something amazing?
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/discover"
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Discover Technologies
                </Link>
                <Link
                  to="/assistant"
                  className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Get AI Assistance
                </Link>
              </div>
            </div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full"></div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Platform Features
                </h2>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group"
                  >
                    <Link
                      to={feature.link}
                      className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Projects
                </h2>
                <Link
                  to="/projects"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {project.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'Development' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          project.status === 'Deployed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          project.status === 'Planning' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {project.progress}%
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    No projects yet
                  </p>
                  <Link
                    to="/discover"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start First Project
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/discover"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200 group"
            >
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Explore Tech</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Discover new technologies</p>
              </div>
            </Link>
            
            <Link
              to="/assistant"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-200 group"
            >
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Assistant</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">Get development help</p>
              </div>
            </Link>
            
            <Link
              to="/investors"
              className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all duration-200 group"
            >
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">Find Investors</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">Connect with funding</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;