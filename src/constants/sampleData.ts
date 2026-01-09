export const SAMPLE_ORIGINAL = `import { useState, useEffect } from 'react';
import { fetchUserData, updateUserProfile } from './api';
import { formatDate, sanitizeInput } from './utils';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

class UserService {
  private users: Map<string, User> = new Map();

  async loadUsers() {
    const data = await fetchUserData();
    this.users = new Map(data.map(user => [user.id, user]));
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save() {
    await updateUserProfile(Array.from(this.users.values()));
  }

  searchUsers(query: string): User[] {
    const normalizedQuery = sanitizeInput(query).toLowerCase();
    return Array.from(this.users.values()).filter(user =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    );
  }
}

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const service = new UserService();
    service.loadUsers().then(() => service.getUser(userId)).then(setUser);
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <p>Theme: {user.preferences.theme}</p>
    </div>
  );
}

export default UserProfile;`;

export const SAMPLE_CHANGED = `import { useState, useEffect, useMemo } from 'react';
import { fetchUserData, updateUserProfile, deleteUser } from './api';
import { formatDate, sanitizeInput, validateEmail } from './utils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
    timezone: string;
  };
  isActive: boolean;
}

class UserService {
  private users: Map<string, User> = new Map();

  async loadUsers() {
    const data = await fetchUserData();
    this.users = new Map(data.map(user => [user.id, user]));
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    if (updates.email && !validateEmail(updates.email)) {
      throw new Error('Invalid email');
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    await updateUserProfile(Array.from(this.users.values()));
    return updatedUser;
  }

  async removeUser(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) {
      await deleteUser(id);
      await updateUserProfile(Array.from(this.users.values()));
    }
    return deleted;
  }

  searchUsers(query: string): User[] {
    const normalizedQuery = sanitizeInput(query).toLowerCase();
    return Array.from(this.users.values()).filter(user =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    );
  }
}

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const service = useMemo(() => new UserService(), []);

  useEffect(() => {
    service.loadUsers().then(() => service.getUser(userId)).then(setUser);
  }, [service, userId]);

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className={\`user-profile theme-\${user.preferences.theme}\`}>
      <div className="header">
        <h2>{user.name}</h2>
        {user.avatar ? <img src={user.avatar} alt={user.name} /> : null}
      </div>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <p>Timezone: {user.preferences.timezone}</p>
      <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}

export default UserProfile;`;
