import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Calendar, ExternalLink, MessageCircle, Rocket, GitBranch, Users, Zap, Brain, Code, Globe, Filter, Search, Clock, Siren as Fire, Award, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Technology } from '../types';

interface TechNewsItem extends Technology {
  isNew?: boolean;
  isHot?: boolean;
  discussionCount?: number;
  lastUpdated?: string;
  modelType?: 'Open Source' | 'Commercial' | 'Research';
  releaseType?: 'Stable' | 'Beta' | 'Alpha';
}

const TechNews: React.FC = () => {
  const [newsItems, setNewsItems] = useState<TechNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const categories = ['All', 'AI/ML', 'Web3', 'DevTools', 'Mobile', 'Cloud'];
  const types = ['All', 'Open Source', 'Commercial', 'Research'];

  useEffect(() => {
    loadTechNews();
  }, []);

  const loadTechNews = async () => {
    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockNewsItems: TechNewsItem[] = [
        {
          id: '1',
          title: 'GPT-4 Turbo with Vision',
          description: 'OpenAI releases GPT-4 Turbo with enhanced vision capabilities, supporting image analysis and multimodal interactions.',
          category: 'AI/ML',
          source: 'OpenAI',
          tags: ['GPT-4', 'Vision', 'Multimodal', 'API'],
          popularity: 98,
          dateAdded: '2024-01-20',
          useCases: ['Image Analysis', 'Document Processing', 'Visual Q&A', 'Content Generation'],
          complexity: 'Intermediate',
          githubStars: 0,
          website: 'https://openai.com/gpt-4',
          isNew: true,
          isHot: true,
          discussionCount: 1247,
          lastUpdated: '2 hours ago',
          modelType: 'Commercial',
          releaseType: 'Stable'
        },
        {
          id: '2',
          title: 'Llama 2 70B Code',
          description: 'Meta releases Llama 2 70B specialized for code generation with improved performance on programming tasks.',
          category: 'AI/ML',
          source: 'Meta',
          tags: ['Llama', 'Code Generation', 'Open Source', 'Programming'],
          popularity: 95,
          dateAdded: '2024-01-19',
          useCases: ['Code Generation', 'Code Review', 'Documentation', 'Debugging'],
          complexity: 'Advanced',
          githubStars: 45600,
          website: 'https://ai.meta.com/llama',
          isNew: true,
          discussionCount: 892,
          lastUpdated: '5 hours ago',
          modelType: 'Open Source',
          releaseType: 'Stable'
        },
        {
          id: '3',
          title: 'Stable Video Diffusion XL',
          description: 'Stability AI unveils enhanced video generation model with 4K resolution support and improved temporal consistency.',
          category: 'AI/ML',
          source: 'Stability AI',
          tags: ['Video Generation', 'Diffusion', '4K', 'Temporal'],
          popularity: 92,
          dateAdded: '2024-01-18',
          useCases: ['Video Creation', 'Animation', 'Marketing Content', 'Film Production'],
          complexity: 'Advanced',
          githubStars: 23400,
          isNew: true,
          isHot: true,
          discussionCount: 567,
          lastUpdated: '8 hours ago',
          modelType: 'Open Source',
          releaseType: 'Beta'
        },
        {
          id: '4',
          title: 'Ethereum 2.0 Dencun Upgrade',
          description: 'Major Ethereum upgrade introducing proto-danksharding and significant gas fee reductions for Layer 2 solutions.',
          category: 'Web3',
          source: 'Ethereum Foundation',
          tags: ['Ethereum', 'Upgrade', 'Layer 2', 'Scaling'],
          popularity: 89,
          dateAdded: '2024-01-17',
          useCases: ['DeFi', 'NFTs', 'Layer 2 Scaling', 'Smart Contracts'],
          complexity: 'Advanced',
          githubStars: 12800,
          website: 'https://ethereum.org',
          discussionCount: 1034,
          lastUpdated: '12 hours ago',
          modelType: 'Open Source',
          releaseType: 'Stable'
        },
        {
          id: '5',
          title: 'Bun 1.0 Runtime',
          description: 'Ultra-fast JavaScript runtime and package manager that aims to replace Node.js with native performance.',
          category: 'DevTools',
          source: 'Oven',
          tags: ['JavaScript', 'Runtime', 'Performance', 'Package Manager'],
          popularity: 87,
          dateAdded: '2024-01-16',
          useCases: ['Web Development', 'Server-side JS', 'Build Tools', 'Package Management'],
          complexity: 'Intermediate',
          githubStars: 67200,
          website: 'https://bun.sh',
          isHot: true,
          discussionCount: 743,
          lastUpdated: '1 day ago',
          modelType: 'Open Source',
          releaseType: 'Stable'
        },
        {
          id: '6',
          title: 'Claude 3 Opus',
          description: 'Anthropic releases Claude 3 Opus, their most capable AI model with enhanced reasoning and safety features.',
          category: 'AI/ML',
          source: 'Anthropic',
          tags: ['Claude', 'Reasoning', 'Safety', 'Constitutional AI'],
          popularity: 94,
          dateAdded: '2024-01-15',
          useCases: ['Research', 'Analysis', 'Writing', 'Problem Solving'],
          complexity: 'Intermediate',
          githubStars: 0,
          website: 'https://anthropic.com',
          isNew: true,
          discussionCount: 456,
          lastUpdated: '1 day ago',
          modelType: 'Commercial',
          releaseType: 'Stable'
        }
      ];
      
      setNewsItems(mockNewsItems);
      setLoading(false);
    }, 1000);
  };

  const handleTechSelect = (tech: TechNewsItem) => {
    // Navigate to AI Assistant with the selected technology
    navigate('/assistant', { state: { selectedTech: tech } });
  };

  const filteredItems = newsItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesType = selectedType === 'All' || item.modelType === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'AI/ML': 'from-purple-500 to-pink-500',
      'Web3': 'from-blue-500 to-cyan-500',
      'DevTools': 'from-green-500 to-emerald-500',
      'Mobile': 'from-orange-500 to-red-500',
      'Cloud': 'from-gray-500 to-slate-500'
    };
    return colors[category as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Open Source': 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      'Commercial': 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
      'Research': 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
  };

  const getReleaseTypeColor = (type: string) => {
    const colors = {
      'Stable': 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      'Beta': 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
      'Alpha': 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading latest tech news...</p>
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
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Fire className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Tech News & Latest Models
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Stay updated with the latest AI models, frameworks, and breakthrough technologies
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {newsItems.filter(item => item.isHot).length} Hot
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {newsItems.filter(item => item.isNew).length} New
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {newsItems.filter(item => item.modelType === 'Open Source').length} Open Source
                </span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {newsItems.reduce((sum, item) => sum + (item.discussionCount || 0), 0)} Discussions
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search technologies, models, frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>{filteredItems.length} items found</span>
            </div>
          </div>
        </motion.div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </div>
                    {item.isNew && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <Zap className="w-3 h-3 mr-1" />
                        New
                      </span>
                    )}
                    {item.isHot && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <Fire className="w-3 h-3 mr-1" />
                        Hot
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.modelType && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.modelType)}`}>
                        {item.modelType}
                      </span>
                    )}
                    {item.releaseType && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReleaseTypeColor(item.releaseType)}`}>
                        {item.releaseType}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">{item.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 4 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{item.tags.length - 4} more</span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    {item.githubStars && item.githubStars > 0 && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {item.githubStars > 1000 ? `${(item.githubStars / 1000).toFixed(1)}k` : item.githubStars}
                      </div>
                    )}
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {item.discussionCount || 0}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {item.popularity}%
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.lastUpdated || new Date(item.dateAdded).toLocaleDateString()}
                  </div>
                </div>

                {/* Source */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Globe className="w-4 h-4 mr-1" />
                    {item.source}
                  </div>
                  {item.website && (
                    <a
                      href={item.website}
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
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => handleTechSelect(item)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Discuss with AI
                  </motion.button>
                  
                  <motion.button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Rocket className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tech news found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TechNews;