export type PlanType = "Free" | "Premium";

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanType;
  tasksCreated: number;
  tasksLimit: number;
  renewalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}