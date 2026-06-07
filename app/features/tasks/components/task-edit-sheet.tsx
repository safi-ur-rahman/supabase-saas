"use client";

import * as React from "react";
import { CalendarIcon, ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TaskType } from "..";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface TaskEditSheetProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: TaskType) => Promise<void>;
}

export function TaskEditSheet({
  task,
  isOpen,
  onClose,
  onSave,
}: TaskEditSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [label, setLabel] = useState("personal");
  const [isCompleted, setIsCompleted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sync form state when a task is opened
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setLabel(task.label.toLowerCase());
      setIsCompleted(task.completed);
      setImagePreview(task.imageUrl || null);
    }
  }, [task, isOpen]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate client side image preview string
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...task,
        title,
        description,
        dueDate,
        label,
        completed: isCompleted,
        imageUrl: imagePreview || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col justify-between p-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 h-full flex flex-col justify-between"
        >
          {/* Top Section: Form Fields */}
          <div className="space-y-6">
            <SheetHeader className="mx-0 px-0 mb-8">
              <SheetTitle>Edit Task</SheetTitle>
              <SheetDescription>
                Make changes to your task details here. Click save when you're
                done.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Title Field */}
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  required
                />
              </div>

              {/* Description Field */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add detailed task notes here..."
                  className="min-h-25 resize-none"
                />
              </div>

              {/* Status Checkbox */}
              <div className="flex items-center space-x-2 pt-2 pb-1">
                <Checkbox
                  id="completed"
                  checked={isCompleted}
                  onCheckedChange={(checked) => setIsCompleted(!!checked)}
                />
                <Label
                  htmlFor="completed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mark as Completed
                </Label>
              </div>

              {/* Due Date Picker & Label Dropdown Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? (
                          format(dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="label">Label</Label>
                  <Select value={label} onValueChange={setLabel}>
                    <SelectTrigger id="label">
                      <SelectValue placeholder="Select label" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="grid gap-2">
                <Label>Task Cover Image</Label>
                {imagePreview ? (
                  <div className="relative rounded-md overflow-hidden border border-input aspect-video bg-muted flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 opacity-90 hover:opacity-100"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-input rounded-md cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                      <UploadCloud className="h-8 w-8 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-medium">
                        Click to upload cover image
                      </p>
                      <p className="text-[10px] text-muted-foreground/80 mt-1">
                        PNG, JPG, or WEBP
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Footer Actions */}
          <SheetFooter className="pt-6 border-t mt-auto flex-row gap-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
