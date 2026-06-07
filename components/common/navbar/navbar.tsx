import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = () => {
  return (
    <nav className="sticky m-0 p-0 top-0 z-50 bg-background">
      <div className="min-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl font-semibold text-foreground">
                Supabase - SaaS Starter Kit
              </h1>
            </div>
          </div>

          <div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
