import { SubscriptionType, UserProfileType } from "../features/account";


export const DummyUser: UserProfileType = {
  id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com",
};

export const DummySubscription: SubscriptionType = {
    id: "sub_456",
    userId: "user_123",
    plan: "Premium",
    tasksCreated: 25,
    tasksLimit: 500,
    createdAt: "2024-01-01",
    updatedAt: "2024-06-01",
}