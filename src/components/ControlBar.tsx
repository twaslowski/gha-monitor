import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCcw } from "lucide-react";
import Link from "next/link";

export const ControlBar: React.FC<{
  onRefresh: () => void;
  workflowUrl: string;
}> = ({ onRefresh, workflowUrl }) => (
  <div className="flex justify-end items-center w-full py-1 px-2 border-b border-gray-200">
    <div className="flex gap-x-2">
      <Button
        onClick={onRefresh}
        aria-label="Refresh Workflow"
        variant="ghost"
        size="icon"
        className="h-6 w-6"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>

      <Link
        href={workflowUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View Workflow"
      >
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  </div>
);
