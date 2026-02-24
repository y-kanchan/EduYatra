import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type User = {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  department: string;
  batch: string;
};

type UserContextType = {
  user: User;
  updateUser: (updates: Partial<User>) => void;
  profilePicture: string;
  updateProfilePicture: (imageUrl: string) => void;
};

const defaultUser: User = {
  name: 'Lunovia',
  email: 'lunovia@gmail.com',
  phone: '+91 8309264567',
  studentId: 'STU2023001',
  department: 'Computer Science',
  batch: '2023',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : defaultUser;
  });
  
  const [profilePicture, setProfilePicture] = useState<string>(() => {
    return localStorage.getItem('profilePicture') || '';
  });

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(user));
  }, [user]);

  // Save profile picture to localStorage whenever it changes
  useEffect(() => {
    if (profilePicture) {
      localStorage.setItem('profilePicture', profilePicture);
    }
  }, [profilePicture]);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  const updateProfilePicture = (imageUrl: string) => {
    setProfilePicture(imageUrl);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, profilePicture, updateProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
