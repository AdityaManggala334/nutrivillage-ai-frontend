import {
  type LoginInput,
  type RegisterInput,
  loginSchema,
  registerSchema,
} from '../schemas/authSchema';
import { type AuthSession, type User, toUserId } from '../types/domain';
import { type AsyncState, asyncError, asyncSuccess } from '../types/state';
import { STORAGE_KEYS, createId, delay, mockHash, readJson, removeKey, writeJson } from './storage';

interface StoredUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: 'user' | 'admin';
  readonly createdAt: string;
}

const readUsers = (): readonly StoredUser[] =>
  readJson<readonly StoredUser[]>(STORAGE_KEYS.users, []);

const toUser = (stored: StoredUser): User => ({
  id: toUserId(stored.id),
  name: stored.name,
  email: stored.email,
  role: stored.role,
  createdAt: stored.createdAt,
});

const buildSession = (stored: StoredUser): AuthSession => ({
  user: toUser(stored),
  token: createId('token'),
  issuedAt: new Date().toISOString(),
});

export const getStoredSession = (): AuthSession | null =>
  readJson<AuthSession | null>(STORAGE_KEYS.session, null);

export const logout = (): void => {
  removeKey(STORAGE_KEYS.session);
};

/** Mock API login (FR-02). */
export const login = async (input: LoginInput): Promise<AsyncState<AuthSession>> => {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return asyncError('Data login tidak valid.', false);
  }

  await delay(700);

  const email = parsed.data.email.trim().toLowerCase();
  const found = readUsers().find((user) => user.email.toLowerCase() === email);

  if (!found || found.passwordHash !== mockHash(parsed.data.password)) {
    return asyncError('Email atau password salah.', false);
  }

  const session = buildSession(found);
  writeJson(STORAGE_KEYS.session, session);
  return asyncSuccess(session);
};

/** Mock API registrasi (FR-01). */
export const register = async (input: RegisterInput): Promise<AsyncState<AuthSession>> => {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return asyncError('Data registrasi tidak valid.', false);
  }

  await delay(900);

  const email = parsed.data.email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email.toLowerCase() === email)) {
    return asyncError('Email sudah terdaftar. Silakan login.', false);
  }

  const stored: StoredUser = {
    id: createId('user'),
    name: parsed.data.name,
    email,
    passwordHash: mockHash(parsed.data.password),
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  writeJson(STORAGE_KEYS.users, [...users, stored]);

  const session = buildSession(stored);
  writeJson(STORAGE_KEYS.session, session);
  return asyncSuccess(session);
};

/** Mode tamu (FR-03): sesi instan tanpa registrasi. */
export const guestLogin = (): AuthSession => {
  const stored: StoredUser = {
    id: 'guest',
    name: 'Tamu',
    email: 'tamu@nutrivillage.ai',
    passwordHash: '',
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  const session = buildSession(stored);
  writeJson(STORAGE_KEYS.session, session);
  return session;
};
