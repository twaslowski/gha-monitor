import { WorkflowRun } from "@/types/workflowRun";

export type Workflow = {
  id: string;
  name: string;
  path: string;
  state: string;
  created_at: string;
  updated_at: string;
  url: string;
  html_url: string;
  badge_url: string;
  runs: WorkflowRun[];
};
