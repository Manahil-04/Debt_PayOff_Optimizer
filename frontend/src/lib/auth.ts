import { toast } from "sonner";

export interface User {
  _id: string; // Changed from id to _id to match MongoDB/Backend
  email: string;
  name?: string;
  is_active?: boolean;
}

// Helper to handle the difference between frontend 'id' usage and backend '_id'
export interface FrontendUser extends Omit<User, '_id'> {
    id: string;
}

const TOKEN_KEY = "pathlight_access_token";
const API_BASE = import.meta.env.VITE_API_URL || "";
const API_URL = `${API_BASE.replace(/\/$/, "")}/api/v1/auth`;

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Map backend user to frontend user (handling _id -> id)
function mapUser(user: User): FrontendUser {
    return {
        ...user,
        id: user._id
    };
}

export async function registerUser(email: string, password: string, name?: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.detail || "Registration failed.");
      return false;
    }

    toast.success("Registration successful! Please log in.");
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("An error occurred during registration.");
    return false;
  }
}

export async function loginUser(email: string, password: string): Promise<FrontendUser | null> {
  try {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      toast.error("Login failed: Invalid email or password.");
      return null;
    }

    const data = await response.json();
    setAuthToken(data.access_token);
    
    // Fetch user details immediately after login to return the user object
    const user = await getCurrentUser();
    if (user) {
        toast.success("Login successful!");
        return user;
    }
    return null;

  } catch (error) {
    console.error("Login error:", error);
    toast.error("An error occurred during login.");
    return null;
  }
}

export async function getCurrentUser(): Promise<FrontendUser | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        // If token is invalid or expired
        if (response.status === 401) {
            clearAuthToken();
        }
        return null;
    }

    const user: User = await response.json();
    return mapUser(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// TODO: Implement backend endpoint for updating user
export async function updateUser(userId: string, updatedData: Partial<Omit<FrontendUser, 'id'>>): Promise<boolean> {
  console.warn("updateUser is not yet implemented on the backend", userId, updatedData);
  toast.info("Profile update not yet supported by backend.");
  return false;
}

export function logoutUser() {
  clearAuthToken();
  toast.info("You have been logged out.");
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/me`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || "Failed to delete account.");
        return false;
    }
    
    clearAuthToken();
    toast.success("Account deleted successfully.");
    return true;
  } catch (error) {
    console.error("Delete account error:", error);
    toast.error("An error occurred while deleting account.");
    return false;
  }
}