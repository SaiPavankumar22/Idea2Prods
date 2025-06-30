import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  ExternalLink, 
  Calendar,
  Tag,
  TrendingUp,
  GitBranch,
  Zap,
  ChevronDown,
  Rocket,
  Loader
} from 'lucide-react';
import { Technology } from '../types';
import { getTechnologies } from '../services/firestore';
import { useNavigate } from 'react-router-dom';

interface TechDiscoveryProps {
  onTechSelect: (tech: Technology) => void;
}

const TechDiscovery: React.FC<TechDiscoveryProps> = ({ onTechSelect }) => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('All');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const categories = ['All', 'AI/ML', 'Web3', 'DevTools', 'Mobile', 'Cloud', 'IoT'];
  const complexities = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadTechnologies();
  }, [selectedCategory, selectedComplexity]);

  const loadTechnologies = async () => {
    setLoading(true);
    try {
      const techs = await getTechnologies({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        complexity: selectedComplexity !== 'All' ? selectedComplexity : undefined,
        limit: 50
      });
      setTechnologies(techs);
    } catch (error) {
      console.error('Error loading technologies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTechSelect = (tech: Technology) => {
    onTechSelect(tech);
    navigate('/assistant');
  };

  const filteredTechnologies = technologies.filter(tech => {
    const matchesSearch = tech.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tech.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'AI/ML': 'from-purple-500 to-pink-500',
      'Web3': 'from-blue-500 to-cyan-500',
      'DevTools': 'from-green-500 to-emerald-500',
      'Mobile': 'from-orange-500 to-red-500',
      'Cloud': 'from-gray-500 to-slate-500',
      'IoT': 'from-indigo-500 to-purple-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      'Beginner': 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      'Intermediate': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Advanced': 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[complexity as keyof typeof colors] || 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading technologies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Discover Emerging Technologies
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
        >
          Stay ahead of the curve with our curated feed of cutting-edge technologies 
          from GitHub, Hugging Face, arXiv, and ProductHunt.
        </motion.p>
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
            placeholder="Search technologies, frameworks, tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTechnologies.length} technologies found
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Complexity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complexity</label>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {complexities.map(complexity => (
                      <option key={complexity} value={complexity}>{complexity}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Technology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTechnologies.map((tech, index) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(tech.category)}`}>
                    {tech.category}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(tech.complexity)}`}>
                    {tech.complexity}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tech.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{tech.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tech.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {tech.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{tech.tags.length - 3} more</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      {tech.githubStars ? `${(tech.githubStars / 1000).toFixed(1)}k` : 'N/A'}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {tech.popularity}%
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(tech.dateAdded).toLocaleDateString()}
                  </div>
                </div>

                {/* Source */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <GitBranch className="w-4 h-4 mr-1" />
                    {tech.source}
                  </div>
                  {tech.website && (
                    <a
                      href={tech.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  onClick={() => handleTechSelect(tech)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Build with This
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTechnologies.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No technologies found</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters.</p>
        </motion.div>
      )}
    </div>
  );
};

export default TechDiscovery;