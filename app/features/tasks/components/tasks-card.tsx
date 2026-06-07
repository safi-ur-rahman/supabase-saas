"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskList } from "./tasks-list";
import { DummyTasks } from "@/app/dummy-data/tasks";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { CreateTaskDialog } from "./create-task-dialog";

export const DashboardTasksCard = () => {
  const tasks = DummyTasks; // Replace with actual data fetching logic

  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            Here is the list of your created tasks.
          </CardDescription>
          <CardAction>
            <Button onClick={() => setIsCreateTaskDialogOpen(true)}>
              <PlusCircle /> Create Task
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <TaskList tasks={tasks} />
        </CardContent>
      </Card>

      <CreateTaskDialog
        open={isCreateTaskDialogOpen}
        isOpen={setIsCreateTaskDialogOpen}
        onCreate={(taskData) => {
          console.log("New Task Data:", taskData);
          // Here you would typically send the new task data to your backend or update your state
        }}
      />
    </>
  );
};
