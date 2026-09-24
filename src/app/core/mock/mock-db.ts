import { User } from '../auth/auth.models';
import { storage } from '../services/storage';
import { DUMMY_CATEGORIES, Dummy } from '../../features/dummies/dummy.model';

/**
 * In-browser "database" used by the mock backend. Persisted to localStorage so data survives
 * a reload. NOTE: passwords are stored in plain text - this is demo code, never ship it.
 */
export interface MockUser extends User {
  password: string;
}

export interface MockDb {
  users: MockUser[];
  dummies: Dummy[];
  nextId: { user: number; dummy: number; file: number };
}

const DB_KEY = 'mock-db';

export const DEMO_USER = { name: 'Demo User', email: 'demo@example.com', password: 'Demo@1234' };

function seed(): MockDb {
  const now = Date.now();
  const dummies: Dummy[] = Array.from({ length: 23 }, (_, i) => ({
    id: i + 1,
    title: `Dummy record ${i + 1}`,
    category: DUMMY_CATEGORIES[i % DUMMY_CATEGORIES.length],
    description: `This is the description of dummy record number ${i + 1}.`,
    created_at: new Date(now - i * 36e5).toISOString(),
  }));
  return {
    users: [{ id: 1, ...DEMO_USER }],
    dummies,
    nextId: { user: 2, dummy: dummies.length + 1, file: 1 },
  };
}

export function loadDb(): MockDb {
  const db = storage.get<MockDb>(DB_KEY);
  return db?.users && db.dummies && db.nextId ? db : seed();
}

export function saveDb(db: MockDb): void {
  storage.set(DB_KEY, db);
}

/** Wipes the mock data back to its seed state. */
export function resetDb(): void {
  storage.remove(DB_KEY);
}
