import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  User,
  Building,
  Calendar,
  FileText,
  ExternalLink,
  TrendingUp,
  MessageCircle,
  Users,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatConversation, ChatMessageInvestor, InvestorConnection } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

const InvestorChat: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessageInvestor[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get connection from navigation state if coming from investor dashboard
  const connectionFromState: InvestorConnection | undefined = location.state?.connection;

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would fetch conversations from Firestore
      // For now, we'll create mock conversations
      const mockConversations: ChatConversation[] = [
        {
          id: '1',
          participants: [user.uid, 'developer1'],
          participantDetails: {
            [user.uid]: {
              name: user.name,
              role: user.role,
            },
            'developer1': {
              name: 'Alex Johnson',
              role: 'developer',
            }
          },
          projectId: 'project1',
          lastMessage: {
            id: 'msg1',
            conversationId: '1',
            senderId: 'developer1',
            content: 'Thanks for accepting my project! I\'m excited to discuss the funding details.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            type: 'text',
            isRead: false
          },
          lastActivity: new Date(Date.now() - 1000 * 60 * 30),
          isActive: true
        },
        {
          id: '2',
          participants: [user.uid, 'developer2'],
          participantDetails: {
            [user.uid]: {
              name: user.name,
              role: user.role,
            },
            'developer2': {
              name: 'Sarah Chen',
              role: 'developer',
            }
          },
          projectId: 'project2',
          lastMessage: {
            id: 'msg2',
            conversationId: '2',
            senderId: user.uid,
            content: 'I\'ve reviewed your MVP documentation. Let\'s schedule a call to discuss next steps.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            type: 'text',
            isRead: true
          },
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isActive: true
        }
      ];
      
      setConversations(mockConversations);
      
      // If coming from investor dashboard with a specific connection, create/select that conversation
      if (connectionFromState && !selectedConversation) {
        const existingConv = mockConversations.find(conv => conv.projectId === connectionFromState.projectId);
        if (existingConv) {
          setSelectedConversation(existingConv);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // In a real implementation, this would fetch messages from Firestore
      const mockMessages: ChatMessageInvestor[] = [
        {
          id: '1',
          conversationId,
          senderId: 'developer1',
          content: 'Hi! Thank you so much for accepting my project connection request. I\'m really excited about the possibility of working together.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          type: 'text',
          isRead: true
        },
        {
          id: '2',
          conversationId,
          senderId: user?.uid || '',
          content: 'Hello Alex! I was impressed by your AI Content Creator project. The use of LangChain and your approach to the MVP looks very promising. I\'d love to learn more about your vision and roadmap.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23 hours ago
          type: 'text',
          isRead: true
        },
        {
          id: '3',
          conversationId,
          senderId: 'developer1',
          content: 'That\'s fantastic to hear! I\'ve been working on this for the past 3 months and we\'re at 65% completion. The market validation has been really positive - we\'ve had 50+ beta users testing the platform.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22 hours ago
          type: 'text',
          isRead: true
        },
        {
          id: '4',
          conversationId,
          senderId: 'developer1',
          content: 'I\'ve attached our latest MVP documentation and financial projections. Would you be available for a call this week to discuss the investment details?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          type: 'text',
          attachments: [
            {
              name: 'MVP_Documentation_v2.pdf',
              url: '#',
              type: 'pdf'
            },
            {
              name: 'Financial_Projections_2024.xlsx',
              url: '#',
              type: 'excel'
            }
          ],
          isRead: false
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const message: ChatMessageInvestor = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      senderId: user.uid,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      isRead: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: message, lastActivity: new Date() }
        : conv
    ));

    // In a real implementation, this would save to Firestore
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = Object.values(conv.participantDetails).find(p => p.role !== user?.role);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Conversations Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => {
              const otherParticipant = Object.entries(conversation.participantDetails)
                .find(([id, details]) => id !== user?.uid)?.[1];
              
              return (
                <motion.div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {otherParticipant?.name}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(conversation.lastActivity)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage?.content}
                      </p>
                      {!conversation.lastMessage?.isRead && conversation.lastMessage?.senderId !== user?.uid && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {Object.entries(selectedConversation.participantDetails)
                          .find(([id, details]) => id !== user?.uid)?.[1]?.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Developer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                  const isOwnMessage = message.senderId === user?.uid;
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center space-x-2 p-2 rounded ${
                                    isOwnMessage ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'
                                  }`}
                                >
                                  <FileText className="w-4 h-4" />
                                  <span className="text-xs truncate">{attachment.name}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorChat;