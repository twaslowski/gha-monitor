import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Workflow = { id: string; name: string; path: string };

type Props = {
  workflows: Workflow[];
  selectedWorkflow: string;
  onChange: (workflowId: string) => void;
};

export default function WorkflowSelect({
  workflows,
  selectedWorkflow,
  onChange,
}: Props) {
  return (
    <div className="mt-4 w-full max-w-md">
      <Label className="mb-1 block">Select Workflow</Label>
      <Select value={selectedWorkflow} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="-- Select a workflow --" />
        </SelectTrigger>
        <SelectContent>
          {workflows.map((wf) => (
            <SelectItem key={wf.id} value={wf.id}>
              {wf.name} ({wf.path})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
