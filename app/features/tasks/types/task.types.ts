export interface Task {
    id: string;
    title: string;
    label: TaskLabel;
    dueDate: Date;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type TaskLabel = "Work" | "Personal" | "Health" | "Urgent" | "Other" | string;