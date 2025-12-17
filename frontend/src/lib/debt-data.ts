import { toast } from "sonner";
import { getAuthToken } from "./auth";

const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE}/api/v1/debts`;
const GOALS_API_URL = `${API_BASE}/api/v1/goals`;

export interface Debt {
  id: string;
  userId: string;
  debtType: string;
  name?: string;
  currentBalance: number;
  annualPercentageRate: number; // Stored as a decimal (e.g., 0.05 for 5%)
  minimumPayment: number;
  createdAt: string;
  updatedAt: string;
}

export type GoalType = 'Pay off faster' | 'Reduce monthly payment' | 'Lower interest';

export interface Goal {
  userId: string;
  goalType: GoalType;
  createdAt: string;
  updatedAt: string;
}

// --- Debt Functions ---

// Helper to handle API errors
async function handleResponse(response: Response, errorMessage: string) {
  if (!response.ok) {
    if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        // Optionally redirect to login or clear token
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorMessage);
  }
  return response.json();
}

function getHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

// Map backend response (which might use _id) to frontend Debt interface
function mapDebt(backendDebt: any): Debt {
    return {
        id: backendDebt._id || backendDebt.id,
        userId: backendDebt.user_id || backendDebt.userId,
        debtType: backendDebt.debtType,
        name: backendDebt.name,
        currentBalance: backendDebt.currentBalance,
        annualPercentageRate: backendDebt.annualPercentageRate,
        minimumPayment: backendDebt.minimumPayment,
        createdAt: backendDebt.created_at || backendDebt.createdAt,
        updatedAt: backendDebt.updated_at || backendDebt.updatedAt
    };
}

export async function getDebtsByUserId(userId: string): Promise<Debt[]> {
    // Note: userId param is currently unused as backend uses the token to identify the user
    // We keep it for signature compatibility or potential future admin use
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getHeaders(),
    });
    
    const data = await handleResponse(response, "Failed to fetch debts");
    return data.map(mapDebt);
  } catch (error) {
    console.error("Error fetching debts:", error);
    toast.error("Failed to load debts.");
    return [];
  }
}

export async function addDebt(
  userId: string,
  newDebtData: Omit<Debt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Debt | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(newDebtData),
    });

    const data = await handleResponse(response, "Failed to add debt");
    toast.success("Debt added successfully!");
    return mapDebt(data);
  } catch (error) {
    console.error("Error adding debt:", error);
    toast.error(error instanceof Error ? error.message : "Failed to add debt.");
    return null;
  }
}

export async function updateDebt(userId: string, updatedDebt: Debt): Promise<boolean> {
  try {
    const { id, userId: _, createdAt, updatedAt, ...updateData } = updatedDebt;
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    await handleResponse(response, "Failed to update debt");
    toast.success("Debt updated successfully!");
    return true;
  } catch (error) {
    console.error("Error updating debt:", error);
    toast.error("Failed to update debt.");
    return false;
  }
}

export async function deleteDebt(userId: string, debtId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/${debtId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    await handleResponse(response, "Failed to delete debt");
    toast.success("Debt deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting debt:", error);
    toast.error("Failed to delete debt.");
    return false;
  }
}

// --- Goal Functions ---

function mapGoal(backendGoal: any): Goal {
    return {
        userId: backendGoal.user_id || backendGoal.userId,
        goalType: backendGoal.goalType,
        createdAt: backendGoal.created_at || backendGoal.createdAt,
        updatedAt: backendGoal.updated_at || backendGoal.updatedAt
    };
}

export async function getGoalByUserId(userId: string): Promise<Goal | null> {
  // Note: userId param is currently unused as backend uses the token to identify the user
  try {
    const response = await fetch(GOALS_API_URL, {
      method: "GET",
      headers: getHeaders(),
    });
    
    // If 404 or null, return null
    if (response.status === 404) return null;
    
    const data = await handleResponse(response, "Failed to fetch goal");
    if (!data) return null;
    
    return mapGoal(data);
  } catch (error) {
    console.error("Error fetching goal:", error);
    // Don't toast here as it might just mean no goal set yet
    return null;
  }
}

export async function setGoal(userId: string, goalType: GoalType): Promise<Goal | null> {
  try {
    const response = await fetch(GOALS_API_URL, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ goalType }),
    });

    const data = await handleResponse(response, "Failed to set goal");
    toast.success("Goal set successfully!");
    return mapGoal(data);
  } catch (error) {
    console.error("Error setting goal:", error);
    toast.error("Failed to set goal.");
    return null;
  }
}