"use client";

import React from "react";
import RepoForm from "@/components/RepoForm";
import WorkflowTile from "@/components/WorkflowTile";
import { useApi } from "@/hooks/use-api";
import { Workflow, WorkflowResponse } from "@/types/workflow";

export default function Home() {
  const { error, isLoading, request } = useApi();
  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);

  async function handleSubmit({ repo }: { repo: string }) {
    if (!repo.includes("/")) {
      alert("Please enter a valid repository in the format 'owner/repo'.");
      return;
    }

    const [owner, repoName] = repo.split("/");
    const url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows`;
    const response = await request<WorkflowResponse>(url);
    setWorkflows(response.workflows);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold text-center">
            GitHub Workflow Monitor
          </h1>

          <RepoForm onSubmit={handleSubmit} />

          {error && (
            <div className="text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
              {error.message}
            </div>
          )}

          {isLoading && <div className="text-blue-600">Loading...</div>}

          <div className="flex flex-wrap gap-4 justify-center w-full">
            {workflows &&
              workflows.map((workflow) => (
                <WorkflowTile key={workflow.id} workflow={workflow} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
