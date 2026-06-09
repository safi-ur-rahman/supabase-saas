"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { handleGoogleLogin } from "./google-login";
import { useRouter } from "next/navigation";

export function Login() {
  const navigate = useRouter();

  const onGoogleLoginClick = () => {
    // Simulate a successful login and navigate to the dashboard
    handleGoogleLogin();
    navigate.push("/dashboard");
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onGoogleLoginClick}
        >
          <Image
            height={16}
            width={16}
            src="/images/google-icon.webp"
            alt="Google Icon"
            className="mr-2"
          />
          Login with Google
        </Button>

        <Separator className="my-4" />

        <p className="my-0 py-0">
          Don't have an account?{" "}
          <Button variant="link" className="px-0 mx-0">
            Sign Up
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
