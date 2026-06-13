import bcrypt from 'bcryptjs';
import { supabase } from './supabase';

export type UserRole = 'admin' | 'student';

export interface AuthUser {
  id: string;
  email?: string;
  registrationNumber?: string;
  fullName?: string;
  class?: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  token?: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Admin login
 */
export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  try {
    // Query admin table
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, password_hash')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const passwordMatch = await comparePassword(password, admin.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create JWT token
    const token = btoa(JSON.stringify({ id: admin.id, email: admin.email, role: 'admin' }));

    return {
      success: true,
      user: {
        id: admin.id.toString(),
        email: admin.email,
        role: 'admin',
      },
      token,
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Student login
 */
export async function loginStudent(registrationNumber: string, password: string): Promise<AuthResponse> {
  try {
    // Query student table
    const { data: student, error } = await supabase
      .from('students')
      .select('id, full_name, registration_number, class, password_hash')
      .eq('registration_number', registrationNumber)
      .single();

    if (error || !student) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const passwordMatch = await comparePassword(password, student.password_hash);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create JWT token
    const token = btoa(JSON.stringify({ id: student.id, registrationNumber: student.registration_number, role: 'student' }));

    return {
      success: true,
      user: {
        id: student.id.toString(),
        registrationNumber: student.registration_number,
        fullName: student.full_name,
        class: student.class,
        role: 'student',
      },
      token,
    };
  } catch (error) {
    console.error('Student login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Decode JWT token
 */
export function decodeToken(token: string): AuthUser | null {
  try {
    const decoded = JSON.parse(atob(token));
    return {
      id: decoded.id.toString(),
      email: decoded.email,
      registrationNumber: decoded.registrationNumber,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Get stored auth token from localStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Store auth token in localStorage
 */
export function storeToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Clear auth token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Get current user from stored token
 */
export function getCurrentUser(): AuthUser | null {
  const token = getStoredToken();
  if (!token) return null;
  return decodeToken(token);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: UserRole): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}
