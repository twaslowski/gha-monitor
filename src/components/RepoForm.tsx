import React from "react";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import AuthButton from "@/components/AuthButton";

type FormValues = {
  repo: string;
  timeframe: string;
};

type RepoFormProps = {
  onSubmit: (data: FormValues) => void;
};

export default function RepoForm({ onSubmit }: RepoFormProps) {
  const { data: session, status } = useSession();
  const form = useForm<FormValues>({
    defaultValues: {
      repo: "",
    },
  });

  const isAuthenticated = status === "authenticated" && session?.accessToken;

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>GitHub Workflow Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {!isAuthenticated ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in with GitHub to access workflow statistics
            </p>
            <AuthButton />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="text-sm text-green-600 mb-2">
                ✓ Authenticated as {session.user?.name}
              </div>
              <FormField
                control={form.control}
                name="repo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="twaslowski/gha-monitor"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2">
                Get Workflow Stats
              </Button>
              <div className="mt-4 pt-4 border-t">
                <AuthButton />
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
