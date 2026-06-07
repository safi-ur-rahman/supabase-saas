"use client;";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Task } from "../types/task.types";
import { format } from "date-fns";
import { getBadgeColor } from "../hooks/getBadgeColor";

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <Table>
      <TableCaption></TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className="cursor-default">
            <TableCell>
              <Checkbox
                id={`task-${task.id}-checkbox`}
                name={`task-${task.id}-checkbox`}
                checked={task.completed}
                // onCheckedChange={(checked) => {
                //   // Handle checkbox change
                // }}
              />
            </TableCell>
            <TableCell>{task.title}</TableCell>
            <TableCell>
              <Badge className={getBadgeColor(task.label)}>{task.label}</Badge>
            </TableCell>
            <TableCell>{format(task.dueDate, "dd/MM/yyyy")}</TableCell>
            <TableCell>{/* Actions like Edit, Delete */}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
