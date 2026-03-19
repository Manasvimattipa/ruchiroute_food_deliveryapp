import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { auth, adminAuth } from '../auth';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(true);

  // Sign up
  const register = async (email, password, displayName) => {
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create the user document in Firestore FIRST
      // This ensures they are "in the database" even if email fails
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName,
        createdAt: new Date().toISOString(),
        role: 'user'
      });

      // Then try to send verification email
      try {
        await sendEmailVerification(userCredential.user);
      } catch (verificationError) {
        console.error("Initial verification email failed:", verificationError);
        // We don't delete the user anymore, just let them resend later
        // or let the registration finish so they can see the "Resend" button.
      }
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  // Log in
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Reload to ensure verification status is up to date
    await userCredential.user.reload();
    return userCredential;
  };

  // Admin Log in (using separate auth instance)
  const adminLogin = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
    return userCredential;
  };

  // Log out
  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  // Send Verification Email
  const resendEmailVerificationEmail = async (user) => {
    if (!user) return;
    return sendEmailVerification(user);
  };

  // Forgot Password
  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update User Profile
  const updateUserProfile = async (data) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, data, { merge: true });
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  useEffect(() => {
    // Standard User Listener
    const unsubUser = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Admin User Listener
    const unsubAdmin = onAuthStateChanged(adminAuth, (user) => {
      setAdminUser(user);
      setAdminLoading(false);
    });

    return () => {
      unsubUser();
      unsubAdmin();
    };
  }, []);

  const value = {
    currentUser,
    adminUser,
    userProfile,
    loading,
    adminLoading,
    register,
    login,
    adminLogin,
    logout,
    updateUserProfile,
    resendEmailVerificationEmail,
    forgotPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
