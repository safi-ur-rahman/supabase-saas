import { Login } from "@/components/forms/auth/login";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Login />
      </div>
    </div>
  );
}
