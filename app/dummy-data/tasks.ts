import { TaskType } from "../features/tasks";

export const DummyTasks: TaskType[] = [
    {
        id: "1",
        title: "Complete project documentation",
        label: "Work",
        dueDate: new Date("2024-07-01"),
        completed: false,
        createdAt: new Date("2024-06-01"),
        updatedAt: new Date("2024-06-15"),
    },
    {
        id: "2",
        title: "Buy groceries",
        label: "Personal",
        dueDate: new Date("2024-06-20"),
        completed: true,
        createdAt: new Date("2024-06-10"),
        updatedAt: new Date("2024-06-18"),
    },
    {
        id: "3",
        title: "Schedule dentist appointment",
        label: "Health",
        dueDate: undefined,
        completed: false,
        createdAt: new Date("2024-06-05"),
        updatedAt: new Date("2024-06-12"),
    }
]