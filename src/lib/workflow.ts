import { Workflow } from "@/types/workflow";
import { WorkflowRun } from "@/types/workflowRun";

export async function fetchWorkflows(owner: string, repoName: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  const url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch workflows: ${res.status}`);
  const data = await res.json();
  return data.workflows as Workflow[];
}

export async function fetchWorkflowRuns(
  workflowId: string,
  owner: string,
  repoName: string,
  lastN: number,
): Promise<WorkflowRun[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  };

  const url = `https://api.github.com/repos/${owner}/${repoName}/actions/workflows/${workflowId}/runs?per_page=${lastN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Failed to fetch workflow runs: ${res.status}`);
  const data = await res.json();
  return data.workflow_runs || [];
}
