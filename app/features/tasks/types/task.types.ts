export interface Task {
    id: string;
    title: string;
    description?: string;
    label: TaskLabel;
    dueDate?: Date;
    completed: boolean;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TaskLabel = "Work" | "Personal" | "Health" | "Study" | "Shopping" | "Urgent" | "Other" | string;