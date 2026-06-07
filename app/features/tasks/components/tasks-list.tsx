"use client";

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
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { TaskDeleteDialog } from "./task-delete-dialog";
import { useState } from "react";

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const onDeleteClick = (taskId: string) => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableCaption></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className={`cursor-default ${task.completed ? "line-through" : ""}`}
            >
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
                <Badge className={getBadgeColor(task.label)}>
                  {task.label}
                </Badge>
              </TableCell>
              <TableCell>{format(task.dueDate, "dd/MM/yyyy")}</TableCell>
              <TableCell className="flex items-center justify-end">
                <Button variant="ghost" size="sm" className="px-2">
                  <Edit className="h-4 w-4 text-gray-400" />
                  <span className="sr-only">Edit Task</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  onClick={() => onDeleteClick(task.id)}
                >
                  <Trash className="h-4 w-4 text-red-400" />
                  <span className="sr-only">Delete Task</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TaskDeleteDialog
        open={isDeleteDialogOpen}
        isOpen={setIsDeleteDialogOpen}
      />
    </>
  );
};
