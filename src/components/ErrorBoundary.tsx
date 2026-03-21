import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch or create user profile
  const fetchProfile = async (currentUser: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        const newProfile: Partial<UserProfile> = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          role: 'user',
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          displayName: currentUser.displayName || '',
          photoURL: currentUser.photoURL || ''
        };

        await setDoc(doc(db, 'users', currentUser.uid), newProfile);
        setUserProfile(newProfile as UserProfile);
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      try {
        handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
      } catch {}
    }
  };

  // 🔥 Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setUserProfile(null);
      }

      setLoading(false); // ✅ Always stop loading
    });

    return () => unsubscribe();
  }, []);

  // 🔄 Refresh profile manually
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  // 🔐 Google Sign-In (WITH persistence)
  const signInWithGoogle = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence); // ✅ Keeps user logged in
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  // 🚪 Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔥 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
