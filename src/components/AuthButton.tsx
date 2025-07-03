"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Github, LogOut } from "lucide-react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button disabled>Loading...</Button>;
  }

  if (session) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Github className="h-4 w-4" />
          <span>Signed in as {session.user?.name || session.user?.email}</span>
        </div>
        <Button
          onClick={() => signOut()}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn("github")}
      className="flex items-center gap-2"
    >
      <Github className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}
