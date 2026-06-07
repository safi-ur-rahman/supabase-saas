import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskList } from "./tasks-list";
import { DummyTasks } from "@/app/dummy-data/tasks";

export const DashboardTasksCard = () => {
  const tasks = DummyTasks; // Replace with actual data fetching logic
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Your Tasks</CardTitle>
        <CardDescription>Here is the list of your created tasks.</CardDescription>
      </CardHeader>
      <CardContent>
          <TaskList tasks={tasks} />
      </CardContent>
    </Card>
  );
};
