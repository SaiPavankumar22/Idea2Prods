import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface User {
  uid: string;
  email: string;
  name: string;
  role: 'developer' | 'investor';
  // Developer specific fields
  experience?: 'Beginner' | 'Intermediate' | 'Expert';
  interests?: string[];
  // Investor specific fields
  firm?: string;
  focus?: string[];
  stage?: string;
  checkSize?: string;
  portfolio?: string[];
  location?: string;
  website?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'developer' | 'investor', additionalData?: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || firebaseUser.displayName || '',
            role: userData.role || 'developer',
            experience: userData.experience,
            interests: userData.interests,
            firm: userData.firm,
            focus: userData.focus,
            stage: userData.stage,
            checkSize: userData.checkSize,
            portfolio: userData.portfolio,
            location: userData.location,
            website: userData.website,
            createdAt: userData.createdAt?.toDate() || new Date()
          });
        } else {
          // Create user document if it doesn't exist
          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: 'developer' as const,
            createdAt: new Date()
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: 'developer' | 'investor', additionalData?: any): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update the user's display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user document in Firestore
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: name,
        role: role,
        createdAt: new Date(),
        ...additionalData
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};