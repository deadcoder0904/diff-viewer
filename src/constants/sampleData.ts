export const SAMPLE_ORIGINAL = `import { useState, useEffect, useCallback } from 'react';
import { fetchUserData, updateUserProfile } from './api';
import { validateEmail, formatDate, sanitizeInput } from './utils';

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

  constructor() {
    this.loadUsers();
  }

  private async loadUsers() {
    try {
      const data = await fetchUserData();
      this.users = new Map(data.map(user => [user.id, user]));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    await this.saveUsers();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    await this.saveUsers();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) {
      await this.saveUsers();
    }
    return deleted;
  }

  private async saveUsers() {
    const usersArray = Array.from(this.users.values());
    await updateUserProfile(usersArray);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  searchUsers(query: string): User[] {
    const normalizedQuery = sanitizeInput(query).toLowerCase();
    return this.getAllUsers().filter(user =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery)
    );
  }
}

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userService = new UserService();
    userService.getUser(userId).then(foundUser => {
      setUser(foundUser);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Joined: {formatDate(user.createdAt)}</p>
      <div className="preferences">
        <span>Theme: {user.preferences.theme}</span>
        <span>Language: {user.preferences.language}</span>
      </div>
    </div>
  );
}

export default UserProfile;`;

export const SAMPLE_CHANGED = `import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUserData, updateUserProfile, deleteUser as apiDeleteUser } from './api';
import { validateEmail, formatDate, sanitizeInput, generateSlug } from './utils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
    timezone: string;
  };
  roles: string[];
  isActive: boolean;
}

interface CreateUserInput {
  name: string;
  email: string;
  preferences?: Partial<User['preferences']>;
  roles?: string[];
}

class UserService {
  private users: Map<string, User> = new Map();
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    await this.loadUsers();
    this.initialized = true;
  }

  private async loadUsers() {
    try {
      const data = await fetchUserData();
      this.users = new Map(data.map(user => [user.id, user]));
    } catch (error) {
      console.error('Failed to load users:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User | null> {
    await this.initialize();
    return this.users.get(id) || null;
  }

  async createUser(input: CreateUserInput): Promise<User> {
    await this.initialize();

    if (!validateEmail(input.email)) {
      throw new Error('Invalid email address');
    }

    const user: User = {
      id: generateSlug(input.name),
      name: sanitizeInput(input.name),
      email: input.email.toLowerCase(),
      createdAt: new Date(),
      preferences: {
        theme: input.preferences?.theme || 'system',
        notifications: input.preferences?.notifications ?? true,
        language: input.preferences?.language || 'en',
        timezone: input.preferences?.timezone || 'UTC',
      },
      roles: input.roles || ['user'],
      isActive: true,
    };

    this.users.set(user.id, user);
    await this.saveUsers();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await this.initialize();
    const user = this.users.get(id);
    if (!user) return null;

    if (updates.email && !validateEmail(updates.email)) {
      throw new Error('Invalid email address');
    }

    const updatedUser = {
      ...user,
      ...updates,
      id: updates.name ? generateSlug(updates.name) : user.id,
    };

    this.users.set(id, updatedUser);
    await this.saveUsers();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.initialize();
    const deleted = this.users.delete(id);
    if (deleted) {
      await apiDeleteUser(id);
      await this.saveUsers();
    }
    return deleted;
  }

  async deactivateUser(id: string): Promise<User | null> {
    return this.updateUser(id, { isActive: false });
  }

  async activateUser(id: string): Promise<User | null> {
    return this.updateUser(id, { isActive: true });
  }

  private async saveUsers() {
    const usersArray = Array.from(this.users.values());
    await updateUserProfile(usersArray);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getActiveUsers(): User[] {
    return this.getAllUsers().filter(user => user.isActive);
  }

  searchUsers(query: string): User[] {
    const normalizedQuery = sanitizeInput(query).toLowerCase();
    return this.getAllUsers().filter(user =>
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      user.roles.some(role => role.toLowerCase().includes(normalizedQuery))
    );
  }

  getUsersByRole(role: string): User[] {
    return this.getAllUsers().filter(user =>
      user.roles.includes(role)
    );
  }

  async recordLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      await this.saveUsers();
    }
  }
}

function UserProfile({ userId, onLogout }: { userId: string; onLogout?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userService = useMemo(() => new UserService(), []);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const foundUser = await userService.getUser(userId);
      setUser(foundUser);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [userId, userService]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogin = async () => {
    await userService.recordLogin(userId);
    await loadUser();
  };

  if (loading && !user) {
    return <div className="loading">Loading user data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={loadUser} className="retry-button">Retry</button>
      </div>
    );
  }

  if (!user) {
    return <div className="not-found">User not found</div>;
  }

  return (
    <div className={\`user-profile theme-\${user.preferences.theme}\`}>
      <div className="profile-header">
        <h2>{user.name}</h2>
        {user.avatar && <img src={user.avatar} alt={user.name} className="avatar" />}
      </div>

      <div className="profile-details">
        <p className="email">
          <span className="label">Email:</span>
          <a href={\`mailto:\${user.email}\`}>{user.email}</a>
        </p>
        <p className="joined">
          <span className="label">Joined:</span>
          {formatDate(user.createdAt)}
        </p>
        {user.lastLogin && (
          <p className="last-login">
            <span className="label">Last login:</span>
            {formatDate(user.lastLogin)}
          </p>
        )}
      </div>

      <div className="preferences">
        <h3>Preferences</h3>
        <div className="preference-item">
          <span>Theme:</span>
          <span className="value">{user.preferences.theme}</span>
        </div>
        <div className="preference-item">
          <span>Language:</span>
          <span className="value">{user.preferences.language}</span>
        </div>
        <div className="preference-item">
          <span>Timezone:</span>
          <span className="value">{user.preferences.timezone}</span>
        </div>
        <div className="preference-item">
          <span>Notifications:</span>
          <span className="value">{user.preferences.notifications ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>

      <div className="roles">
        <h3>Roles</h3>
        <ul className="role-list">
          {user.roles.map(role => (
            <li key={role} className="role-item">{role}</li>
          ))}
        </ul>
      </div>

      <div className="status">
        Status: <span className={user.isActive ? 'active' : 'inactive'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="actions">
        <button onClick={handleLogin} className="action-button">Record Login</button>
        {onLogout && (
          <button onClick={onLogout} className="logout-button">Logout</button>
        )}
      </div>
    </div>
  );
}

export default UserProfile;`;
