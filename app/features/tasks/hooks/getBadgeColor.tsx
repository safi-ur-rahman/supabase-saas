import { TaskLabel } from "../types/task.types";

export const getBadgeColor = (taskLabel: TaskLabel): string => {
  const normalizedLabel = taskLabel.toLowerCase().trim();

  const colorMap: Record<string, string> = {
    work: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
    personal: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20",
    health: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
    urgent: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
    other: "bg-white-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20",
  };

  // Fallback to a neutral gray if the label doesn't match any key
  return colorMap[normalizedLabel] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
};