import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  Search,
  FolderOpen,
  Brain,
  Users,
  Settings,
  LogOut,
  User,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  Zap,
  TrendingUp,
  MessageCircle,
  Building
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const developerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Discover', href: '/discover', icon: Search },
    { name: 'Tech News', href: '/tech-news', icon: TrendingUp },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'AI Assistant', href: '/assistant', icon: Brain },
    { name: 'Investors', href: '/investors', icon: Users },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
  ];

  const investorNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Building },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Discover', href: '/discover', icon: Search },
  ];

  const navigation = user?.role === 'investor' ? investorNavigation : developerNavigation;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Idea2Prod
              </span>
            </motion.div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Role Badge */}
        {!isCollapsed && user && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              user.role === 'investor' 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              {user.role === 'investor' ? (
                <Building className="w-3 h-3 mr-1" />
              ) : (
                <Zap className="w-3 h-3 mr-1" />
              )}
              {user.role === 'investor' ? 'Investor' : 'Developer'}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  {item.name}
                </motion.span>
              )}
              {item.name === 'Tech News' && !isCollapsed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-2 h-2 bg-red-500 rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Theme Toggle */}
          <div className="mb-4">
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </motion.span>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 w-full ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                user?.role === 'investor' 
                  ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                  : 'bg-gradient-to-br from-accent-400 to-accent-600'
              }`}>
                {user?.role === 'investor' ? (
                  <Building className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role === 'investor' ? user?.firm : user?.email}
                  </p>
                </motion.div>
              )}
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && !isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                >
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Help & Support
                  </button>
                  <hr className="my-2 border-gray-200 dark:border-gray-700" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Button for Collapsed State */}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-3 py-2 mt-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;