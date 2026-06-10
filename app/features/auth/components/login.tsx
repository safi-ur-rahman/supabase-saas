"use client";

import { useState } from "react";
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

export function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const onGoogleLoginClick = async () => {
    setIsLoading(true);
    try {
      await handleGoogleLogin();
    } finally {
      // The browser usually handles external redirection here, but we switch flags off safely just in case
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your credentials below or use your Google workspace identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="opacity-50">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                disabled
                className="opacity-50 cursor-not-allowed"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="opacity-50">Password</Label>
                <span className="ml-auto inline-block text-xs text-muted-foreground opacity-50">
                  Password disabled
                </span>
              </div>
              <Input id="password" type="password" disabled className="opacity-50 cursor-not-allowed" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="button" className="w-full opacity-50" disabled>
          Login with Email
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onGoogleLoginClick}
          disabled={isLoading}
        >
          <Image
            height={16}
            width={16}
            src="/images/google-icon.webp"
            alt="Google Icon"
            className="mr-2"
          />
          {isLoading ? "Connecting to Google..." : "Login with Google"}
        </Button>

        <Separator className="my-4" />

        <p className="my-0 py-0 text-sm text-center text-muted-foreground">
          Don't have an account? Sign in with Google to cleanly provision your custom database account.
        </p>
      </CardFooter>
    </Card>
  );
}