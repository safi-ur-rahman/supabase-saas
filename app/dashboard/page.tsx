import { DashboardTasksCard } from "../features/tasks/components/tasks-card";

const DashboardPage = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-10">
      <DashboardTasksCard />
    </div>
  );
};

export default DashboardPage;
