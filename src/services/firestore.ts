import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { Technology, Project, Investor, ChatMessage, MVPDocument, InvestorConnection, ChatConversation, ChatMessageInvestor } from '../types';

// Technology Services
export const getTechnologies = async (filters?: {
  category?: string;
  complexity?: string;
  limit?: number;
}): Promise<Technology[]> => {
  try {
    let q = query(collection(db, 'technologies'), orderBy('popularity', 'desc'));
    
    if (filters?.category && filters.category !== 'All') {
      q = query(q, where('category', '==', filters.category));
    }
    
    if (filters?.complexity && filters.complexity !== 'All') {
      q = query(q, where('complexity', '==', filters.complexity));
    }
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Technology[];
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return [];
  }
};

export const addTechnology = async (technology: Omit<Technology, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'technologies'), {
      ...technology,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding technology:', error);
    return null;
  }
};

// Project Services
export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, 'projects'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString(),
      estimatedCompletion: doc.data().estimatedCompletion?.toDate()?.toISOString() || new Date().toISOString()
    })) as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const addProject = async (project: Omit<Project, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...project,
      createdAt: Timestamp.now(),
      estimatedCompletion: project.estimatedCompletion ? Timestamp.fromDate(new Date(project.estimatedCompletion)) : null
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    return null;
  }
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<boolean> => {
  try {
    const updateData: any = { ...updates };
    
    // Convert date strings to Timestamps if needed
    if (updates.estimatedCompletion) {
      updateData.estimatedCompletion = Timestamp.fromDate(new Date(updates.estimatedCompletion));
    }
    
    await updateDoc(doc(db, 'projects', projectId), updateData);
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    return false;
  }
};

// MVP Document Services
export const addMVPDocument = async (mvpDoc: Omit<MVPDocument, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'mvpDocuments'), {
      ...mvpDoc,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding MVP document:', error);
    return null;
  }
};

export const updateMVPDocument = async (docId: string, updates: Partial<MVPDocument>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'mvpDocuments', docId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating MVP document:', error);
    return false;
  }
};

// Real-time Investor Services
export const subscribeToInvestors = (
  callback: (investors: Investor[]) => void,
  filters?: {
    stage?: string;
    focus?: string;
    activelyInvesting?: boolean;
    limit?: number;
  }
): Unsubscribe => {
  try {
    let q = query(
      collection(db, 'users'),
      where('role', '==', 'investor'),
      orderBy('createdAt', 'desc')
    );
    
    if (filters?.stage && filters.stage !== 'All') {
      q = query(q, where('stage', '==', filters.stage));
    }
    
    if (filters?.activelyInvesting !== undefined) {
      q = query(q, where('activelyInvesting', '==', filters.activelyInvesting));
    }
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const investors: Investor[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          firm: data.firm || '',
          focus: data.focus || [],
          stage: data.stage || 'Pre-seed',
          checkSize: data.checkSize || '',
          portfolio: data.portfolio || [],
          location: data.location || '',
          website: data.website || '',
          activelyInvesting: data.activelyInvesting || false,
          matchScore: calculateMatchScore(data), // Calculate based on user data
          createdAt: data.createdAt?.toDate()
        };
      });
      callback(investors);
    });
  } catch (error) {
    console.error('Error subscribing to investors:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Helper function to calculate match score
const calculateMatchScore = (investorData: any): number => {
  // Simple scoring algorithm - can be enhanced
  let score = 50; // Base score
  
  if (investorData.activelyInvesting) score += 30;
  if (investorData.portfolio && investorData.portfolio.length > 0) score += 20;
  if (investorData.focus && investorData.focus.length > 0) score += 10;
  
  return Math.min(score, 100);
};

// Legacy function for backward compatibility
export const getInvestors = async (filters?: {
  stage?: string;
  focus?: string;
  limit?: number;
}): Promise<Investor[]> => {
  return new Promise((resolve) => {
    const unsubscribe = subscribeToInvestors((investors) => {
      unsubscribe();
      resolve(investors);
    }, filters);
  });
};

// Investor Connection Services
export const addInvestorConnection = async (connection: Omit<InvestorConnection, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'investorConnections'), {
      ...connection,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding investor connection:', error);
    return null;
  }
};

export const subscribeToInvestorConnections = (
  userId: string,
  callback: (connections: InvestorConnection[]) => void
): Unsubscribe => {
  try {
    const q = query(
      collection(db, 'investorConnections'),
      where('investorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const connections: InvestorConnection[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as InvestorConnection[];
      callback(connections);
    });
  } catch (error) {
    console.error('Error subscribing to investor connections:', error);
    return () => {};
  }
};

export const getInvestorConnections = async (userId: string): Promise<InvestorConnection[]> => {
  return new Promise((resolve) => {
    const unsubscribe = subscribeToInvestorConnections(userId, (connections) => {
      unsubscribe();
      resolve(connections);
    });
  });
};

export const updateInvestorConnection = async (connectionId: string, updates: Partial<InvestorConnection>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'investorConnections', connectionId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error updating investor connection:', error);
    return false;
  }
};

// Real-time Chat Services
export const subscribeToChatConversations = (
  userId: string,
  callback: (conversations: ChatConversation[]) => void
): Unsubscribe => {
  try {
    const q = query(
      collection(db, 'chatConversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastActivity', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const conversations: ChatConversation[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActivity: doc.data().lastActivity?.toDate()
      })) as ChatConversation[];
      callback(conversations);
    });
  } catch (error) {
    console.error('Error subscribing to chat conversations:', error);
    return () => {};
  }
};

export const subscribeToInvestorChatMessages = (
  conversationId: string,
  callback: (messages: ChatMessageInvestor[]) => void
): Unsubscribe => {
  try {
    const q = query(
      collection(db, 'investorChatMessages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages: ChatMessageInvestor[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as ChatMessageInvestor[];
      callback(messages);
    });
  } catch (error) {
    console.error('Error subscribing to investor chat messages:', error);
    return () => {};
  }
};

export const addChatConversation = async (conversation: Omit<ChatConversation, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'chatConversations'), {
      ...conversation,
      lastActivity: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding chat conversation:', error);
    return null;
  }
};

export const addInvestorChatMessage = async (message: Omit<ChatMessageInvestor, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'investorChatMessages'), {
      ...message,
      timestamp: Timestamp.now()
    });
    
    // Update conversation's last activity
    await updateDoc(doc(db, 'chatConversations', message.conversationId), {
      lastActivity: Timestamp.now(),
      lastMessage: {
        ...message,
        id: docRef.id,
        timestamp: new Date()
      }
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding investor chat message:', error);
    return null;
  }
};

// Auto-create chat conversation when connection is accepted
export const createChatFromConnection = async (connection: InvestorConnection): Promise<string | null> => {
  try {
    // Get user details for both participants
    const developerDoc = await getDoc(doc(db, 'users', connection.userId));
    const investorDoc = await getDoc(doc(db, 'users', connection.investorId));
    
    if (!developerDoc.exists() || !investorDoc.exists()) {
      throw new Error('User documents not found');
    }
    
    const developerData = developerDoc.data();
    const investorData = investorDoc.data();
    
    const conversation: Omit<ChatConversation, 'id'> = {
      participants: [connection.userId, connection.investorId],
      participantDetails: {
        [connection.userId]: {
          name: developerData.name,
          role: 'developer'
        },
        [connection.investorId]: {
          name: investorData.name,
          role: 'investor'
        }
      },
      projectId: connection.projectId,
      lastActivity: new Date(),
      isActive: true
    };
    
    const conversationId = await addChatConversation(conversation);
    
    if (conversationId) {
      // Add initial message
      await addInvestorChatMessage({
        conversationId,
        senderId: connection.investorId,
        content: `Hi! I've accepted your connection request for "${connection.projectData.title}". I'm excited to learn more about your project and discuss potential collaboration opportunities.`,
        timestamp: new Date(),
        type: 'text',
        isRead: false
      });
    }
    
    return conversationId;
  } catch (error) {
    console.error('Error creating chat from connection:', error);
    return null;
  }
};

// Legacy chat functions for backward compatibility
export const getChatMessages = async (userId: string, projectId?: string): Promise<ChatMessage[]> => {
  try {
    let q = query(
      collection(db, 'chatMessages'), 
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );
    
    if (projectId) {
      q = query(
        collection(db, 'chatMessages'),
        where('userId', '==', userId),
        where('projectId', '==', projectId),
        orderBy('timestamp', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    })) as ChatMessage[];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};

export const addChatMessage = async (message: Omit<ChatMessage, 'id'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, 'chatMessages'), {
      ...message,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding chat message:', error);
    return null;
  }
};

// Initialize sample data (removed investor data)
export const initializeSampleData = async (): Promise<void> => {
  try {
    // Check if sample data already exists
    const techSnapshot = await getDocs(query(collection(db, 'technologies'), limit(1)));
    if (!techSnapshot.empty) {
      return; // Sample data already exists
    }

    // Add sample technologies only
    const sampleTechnologies: Omit<Technology, 'id'>[] = [
      {
        title: 'LangChain 0.3.0',
        description: 'Revolutionary framework for developing applications with large language models, featuring improved memory management and tool integration.',
        category: 'AI/ML',
        source: 'GitHub',
        tags: ['LLM', 'Framework', 'Python', 'JavaScript'],
        popularity: 95,
        dateAdded: '2024-01-15',
        useCases: ['Chatbots', 'Document Analysis', 'Code Generation', 'Content Creation'],
        complexity: 'Intermediate',
        githubStars: 87500,
        website: 'https://langchain.com'
      },
      {
        title: 'Stable Video Diffusion',
        description: 'Text-to-video generation model that creates high-quality videos from simple text prompts with unprecedented realism.',
        category: 'AI/ML',
        source: 'Hugging Face',
        tags: ['Computer Vision', 'Video Generation', 'Diffusion Models'],
        popularity: 92,
        dateAdded: '2024-01-14',
        useCases: ['Marketing Videos', 'Animation', 'Social Media Content', 'Prototyping'],
        complexity: 'Advanced',
        githubStars: 45300,
      },
      {
        title: 'Supabase Realtime v2',
        description: 'Enhanced real-time database with improved performance, WebSocket connections, and multi-tenant architecture.',
        category: 'DevTools',
        source: 'GitHub',
        tags: ['Database', 'Real-time', 'PostgreSQL', 'WebSocket'],
        popularity: 88,
        dateAdded: '2024-01-13',
        useCases: ['Live Chat', 'Collaborative Apps', 'Gaming', 'IoT Dashboards'],
        complexity: 'Beginner',
        githubStars: 65200,
        website: 'https://supabase.com'
      },
      {
        title: 'Polkadot 2.0',
        description: 'Next-generation blockchain platform with enhanced interoperability, scalability, and governance mechanisms.',
        category: 'Web3',
        source: 'GitHub',
        tags: ['Blockchain', 'Interoperability', 'Rust', 'Smart Contracts'],
        popularity: 85,
        dateAdded: '2024-01-12',
        useCases: ['DeFi Applications', 'Cross-chain Bridges', 'DAOs', 'NFT Marketplaces'],
        complexity: 'Advanced',
        githubStars: 7100,
        website: 'https://polkadot.network'
      },
      {
        title: 'React Native 0.74',
        description: 'Latest React Native with improved performance, new architecture, and enhanced developer experience.',
        category: 'Mobile',
        source: 'GitHub',
        tags: ['Mobile', 'React', 'JavaScript', 'Cross-platform'],
        popularity: 90,
        dateAdded: '2024-01-11',
        useCases: ['Mobile Apps', 'Cross-platform Development', 'Enterprise Apps'],
        complexity: 'Intermediate',
        githubStars: 116000,
        website: 'https://reactnative.dev'
      },
      {
        title: 'Edge Runtime',
        description: 'Serverless computing platform optimized for edge deployment with ultra-low latency and global distribution.',
        category: 'Cloud',
        source: 'ProductHunt',
        tags: ['Serverless', 'Edge Computing', 'CDN', 'Performance'],
        popularity: 82,
        dateAdded: '2024-01-10',
        useCases: ['API Endpoints', 'Real-time Processing', 'Global Apps', 'CDN Functions'],
        complexity: 'Intermediate',
        githubStars: 23400,
      }
    ];

    for (const tech of sampleTechnologies) {
      await addTechnology(tech);
    }

    console.log('Sample technologies initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};