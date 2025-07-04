"use client";

import React, { useState } from "react";
import RepoForm from "@/components/RepoForm";
import WorkflowRunsTable from "@/components/WorkflowRunsTable";
import { WorkflowRun } from "@/types/workflowRun";
import { Workflow } from "@/types/workflow";
import { fetchWorkflows } from "@/lib/workflow";
import WorkflowTile from "@/components/WorkflowTile";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<WorkflowRun[] | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[] | null>(null);

  async function handleSubmit({ repo }: { repo: string }) {
    setError(null);
    setResults(null);
    setWorkflows(null);
    setLoading(true);

    if (!repo.includes("/")) {
      setError("Repository must be in the format username/repository");
      setLoading(false);
      return;
    }
    const [owner, repoName] = repo.split("/");
    try {
      const workflows = await fetchWorkflows(owner, repoName);
      setWorkflows(workflows);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch workflows");
      }
    } finally {
      setLoading(false);
    }
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
              {error}
            </div>
          )}

          {loading && <div className="text-blue-600">Loading...</div>}

          <div className="flex flex-wrap gap-4 justify-center w-full">
            {workflows &&
              workflows.length > 0 &&
              workflows.map((workflow) => (
                <WorkflowTile key={workflow.id} workflow={workflow} />
              ))}
          </div>

          {results && results.length > 0 && (
            <WorkflowRunsTable results={results} />
          )}
        </div>
      </div>
    </div>
  );
}
