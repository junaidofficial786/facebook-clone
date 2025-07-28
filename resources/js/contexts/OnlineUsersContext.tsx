import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnlineUser {
  id: number;
  name: string;
  email: string;
}

interface OnlineUsersContextType {
  onlineUsers: OnlineUser[];
  isUserOnline: (userId: number) => boolean;
}

const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(undefined);

export function OnlineUsersProvider({ children }: { children: ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // Initialize Echo listener for online users
    if (typeof window !== 'undefined' && window.Echo) {
      window.Echo.join('online-users')
        .here((users: OnlineUser[]) => {
          console.log("Currently online:", users);
          setOnlineUsers(users);
        })
        .joining((user: OnlineUser) => {
          console.log(`${user.name} (${user.email}) just came online.`);
          setOnlineUsers(prev => [...prev, user]);
        })
        .leaving((user: OnlineUser) => {
          console.log(`${user.name} (${user.email}) just went offline.`);
          setOnlineUsers(prev => prev.filter(u => u.id !== user.id));
        });
    }
  }, []);

  const isUserOnline = (userId: number): boolean => {
    return onlineUsers.some(user => user.id === userId);
  };

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, isUserOnline }}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export function useOnlineUsers() {
  const context = useContext(OnlineUsersContext);
  if (!context) {
    throw new Error('useOnlineUsers must be used within an OnlineUsersProvider');
  }
  return context;
}
