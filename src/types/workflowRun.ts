export type WorkflowRunResponse = {
  total_count: number;
  workflow_runs: WorkflowRun[];
};

export type WorkflowRun = {
  id: string;
  status: string;
  conclusion?: string;
  created_at: string;
  updated_at?: string;
  html_url: string;
};
