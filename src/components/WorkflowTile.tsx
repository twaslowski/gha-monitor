import React, { useEffect, useState } from "react";
import { Workflow } from "@/types/workflow";
import { Card } from "@/components/ui/card";
import { WorkflowRun } from "@/types/workflowRun";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
} from "date-fns";

interface WorkflowTileProps {
  workflow: Workflow;
}

const WorkflowTile: React.FC<WorkflowTileProps> = ({ workflow }) => {
  const [lastRun, setLastRun] = useState<WorkflowRun | null>(null);

  useEffect(() => {
    const fetchLastRun = async () => {
      try {
        const response = await fetch(`${workflow.url}/runs?per_page=1`);
        if (!response.ok) {
          throw new Error("Failed to fetch the last workflow run");
        }
        const data = await response.json();
        console.log(data);
        setLastRun(data.workflow_runs[0] || null);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchLastRun();
  }, [workflow.url]);

  const getStatusClass = () => {
    if (!lastRun) return "bg-gray-100";
    if (lastRun.status === "pending")
      return "bg-yellow-100 border-yellow-500 text-yellow-800";
    switch (lastRun.conclusion) {
      case "success":
        return "bg-green-100 border-green-500 text-green-800";
      case "failure":
        return "bg-red-100 border-red-500 text-red-800";
      case "cancelled":
        return "bg-orange-100 border-orange-500 text-orange-800";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };

  const getDuration = () => {
    if (!lastRun || !lastRun.created_at || !lastRun.updated_at) return "N/A";
    const start = new Date(lastRun.created_at);
    const end = new Date(lastRun.updated_at);
    const duration = intervalToDuration({ start, end });
    return formatDuration(duration);
  };

  return (
    <Card
      className={`relative flex flex-col text-center items-center border w-64 h-32 gap-1 ${getStatusClass()}`}
    >
      <Link
        href={lastRun === null ? workflow.html_url : lastRun!.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-800 hover:text-black"
        aria-label="View Workflow"
      >
        <ExternalLink className="absolute top-2 right-2 w-5 h-5 cursor-pointer" />
      </Link>
      <h3 className="text-lg font-bold leading-tight">{workflow.name}</h3>
      {lastRun ? (
        <>
          <p className="text-sm leading-tight">
            {formatDistanceToNow(new Date(lastRun.created_at), {
              addSuffix: true,
            })}
          </p>
          <p className="text-sm leading-tight">Duration: {getDuration()}</p>
        </>
      ) : (
        <p className="text-sm">Failed to fetch last workflow run.</p>
      )}
    </Card>
  );
};

export default WorkflowTile;
