'use client';

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [token, setToken] = useState("");
  const [workflows, setWorkflows] = useState<any[] | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");

  async function fetchWorkflows(owner: string, repoName: string, tokenInput: string) {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (tokenInput) headers["Authorization"] = `Bearer ${tokenInput}`;
    const url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed to fetch workflows: ${res.status}`);
    const data = await res.json();
    setWorkflows(data.workflows || []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResults(null);
    setWorkflows(null);
    setSelectedWorkflow("");
    setLoading(true);
    const form = e.currentTarget;
    const repo = (form.repo as HTMLInputElement).value.trim();
    const timeframe = (form.timeframe as HTMLSelectElement).value;
    const tokenInput = (form.token as HTMLInputElement).value.trim();
    setToken(tokenInput);
    if (!repo.includes("/")) {
      setError("Repository must be in the format username/repository");
      setLoading(false);
      return;
    }
    const [owner, repoName] = repo.split("/");
    try {
      await fetchWorkflows(owner, repoName, tokenInput);
    } catch (err: any) {
      setError(err.message || "Failed to fetch workflows");
    } finally {
      setLoading(false);
    }
  }

  async function handleWorkflowSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const workflowId = e.target.value;
    setSelectedWorkflow(workflowId);
    setLoading(true);
    setError(null);
    setResults(null);
    const repo = (document.querySelector('input[name="repo"]') as HTMLInputElement)?.value.trim();
    const timeframe = (document.querySelector('select[name="timeframe"]') as HTMLSelectElement)?.value;
    const tokenInput = token;
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
      let runs: any[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        let url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows/${workflowId}/runs?per_page=100&page=${page}`;
        if (since) url += `&created=>${since}`;
        const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
        if (tokenInput) headers["Authorization"] = `Bearer ${tokenInput}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        runs = runs.concat(data.workflow_runs || []);
        hasMore = data.workflow_runs && data.workflow_runs.length === 100;
        page++;
      }
      setResults(runs);
    } catch (err: any) {
      setError(err.message || "Failed to fetch workflow runs");
    } finally {
      setLoading(false);
    }
  }

  // Utility to format seconds as h:mm:ss or m:ss
  function formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}h:${m.toString().padStart(2, "0")}m:${s.toString().padStart(2, "0")}s`;
    } else {
      return `${m}m:${s.toString().padStart(2, "0")}s`;
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <form className="flex flex-col gap-4 w-full max-w-md bg-white/80 dark:bg-black/30 p-6 rounded-xl shadow border border-black/10 dark:border-white/10" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 font-medium">
            GitHub Token
            <input
              type="password"
              name="token"
              placeholder="Paste your GitHub token here"
              className="border rounded px-3 py-2 text-base bg-white dark:bg-black/40 border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1 font-medium">
            GitHub Repository
            <input
              type="text"
              name="repo"
              placeholder="username/repository"
              className="border rounded px-3 py-2 text-base bg-white dark:bg-black/40 border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>
          <label className="flex flex-col gap-1 font-medium">
            Timeframe
            <select
              name="timeframe"
              className="border rounded px-3 py-2 text-base bg-white dark:bg-black/40 border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue="7d"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-2 rounded bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Workflow Stats
          </button>
        </form>
        {loading && <div className="mt-4 text-blue-600">Loading...</div>}
        {error && <div className="mt-4 text-red-600">{error}</div>}
        {workflows && (
          <div className="mt-4 w-full max-w-md">
            <label className="flex flex-col gap-1 font-medium">
              Select Workflow
              <select
                className="border rounded px-3 py-2 text-base bg-white dark:bg-black/40 border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedWorkflow}
                onChange={handleWorkflowSelect}
              >
                <option value="">-- Select a workflow --</option>
                {workflows.map((wf: any) => (
                  <option key={wf.id} value={wf.id}>{wf.name} ({wf.path})</option>
                ))}
              </select>
            </label>
          </div>
        )}
        {results && (
          <div className="mt-4 w-full max-w-2xl">
            <h2 className="font-bold mb-2">Workflow Runs ({results.length})</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-black/10 dark:bg-white/10">
                  <th className="p-2 border">Run ID</th>
                  <th className="p-2 border">Conclusion</th>
                  <th className="p-2 border">Duration</th>
                  <th className="p-2 border">Started</th>
                  <th className="p-2 border">URL</th>
                </tr>
              </thead>
              <tbody>
                {results.map((run: any) => {
                  const start = run.created_at ? new Date(run.created_at) : null;
                  const end = run.updated_at ? new Date(run.updated_at) : null;
                  const duration = start && end ? Math.round((end.getTime() - start.getTime()) / 1000) : null;
                  let conclusion = run.conclusion || run.status;
                  let color = '';
                  if (conclusion === 'success') color = 'bg-green-100 text-green-800';
                  else if (conclusion === 'failure') color = 'bg-red-100 text-red-800';
                  else if (conclusion === 'startup_failure') color = 'bg-red-100 text-red-800';
                  else if (conclusion === 'cancelled') color = 'bg-yellow-100 text-yellow-800';
                  else if (conclusion === 'skipped') color = 'bg-gray-100 text-gray-800';
                  else color = 'bg-blue-100 text-blue-800';
                  return (
                    <tr key={run.id} className="even:bg-black/5 dark:even:bg-white/5">
                      <td className="p-2 border">{run.id}</td>
                      <td className={`p-2 border font-semibold rounded ${color}`}>{conclusion}</td>
                      <td className="p-2 border">{duration !== null ? formatDuration(duration) : "-"}</td>
                      <td className="p-2 border">{run.created_at ? new Date(run.created_at).toLocaleString() : "-"}</td>
                      <td className="p-2 border">
                        <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
