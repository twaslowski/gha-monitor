"use client";

import React, { useState } from "react";
import RepoForm from "@/components/RepoForm";
import WorkflowSelect from "@/components/WorkflowSelect";
import WorkflowRunsTable from "@/components/WorkflowRunsTable";
import { WorkflowRun } from "@/types/workflowRun";
import { Workflow } from "@/types/workflow";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<WorkflowRun[] | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[] | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const [repo, setRepo] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("7d");

  async function fetchWorkflows(
    owner: string,
    repoName: string,
    timeframe: string,
  ) {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (session) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    let url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows`;

    // Add created filter if timeframe is specified
    if (timeframe === "7d" || timeframe === "30d") {
      const days = timeframe === "7d" ? 7 : 30;
      const date = new Date();
      date.setDate(date.getDate() - days);
      const since = date.toISOString();
      url += `?created=>${since}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch workflows: ${res.status}`);
    const data: { workflows?: Workflow[] } = await res.json();
    setWorkflows(data.workflows || []);
  }

  async function handleSubmit({
    repo,
    timeframe,
  }: {
    repo: string;
    timeframe: string;
  }) {
    setError(null);
    setResults(null);
    setWorkflows(null);
    setSelectedWorkflow("");
    setLoading(true);
    setRepo(repo);
    setTimeframe(timeframe);

    if (!repo.includes("/")) {
      setError("Repository must be in the format username/repository");
      setLoading(false);
      return;
    }
    const [owner, repoName] = repo.split("/");
    try {
      await fetchWorkflows(owner, repoName, timeframe);
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

  async function handleWorkflowSelect(workflowId: string) {
    setSelectedWorkflow(workflowId);
    setLoading(true);
    setError(null);
    setResults(null);

    if (!repo || !repo.includes("/")) {
      setError("Repository must be in the format username/repository");
      setLoading(false);
      return;
    }
    const [owner, repoName] = repo.split("/");
    let since: string | undefined;
    if (timeframe === "7d" || timeframe === "30d") {
      const days = timeframe === "7d" ? 7 : 30;
      const date = new Date();
      date.setDate(date.getDate() - days);
      since = date.toISOString();
    }
    try {
      let runs: WorkflowRun[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        let url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows/${workflowId}/runs?per_page=100&page=${page}`;
        if (since) url += `&created=>${since}`;
        const headers: Record<string, string> = {
          Accept: "application/vnd.github+json",
        };
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data: { workflow_runs?: WorkflowRun[] } = await res.json();
        runs = runs.concat(data.workflow_runs || []);
        hasMore =
          data.workflow_runs !== undefined && data.workflow_runs.length === 100;
        page++;
      }
      setResults(runs);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch workflow runs");
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

          {workflows && workflows.length > 0 && (
            <WorkflowSelect
              workflows={workflows}
              onChange={handleWorkflowSelect}
              selectedWorkflow={selectedWorkflow}
            />
          )}

          {results && results.length > 0 && (
            <WorkflowRunsTable results={results} />
          )}
        </div>
      </div>
    </div>
  );
}
