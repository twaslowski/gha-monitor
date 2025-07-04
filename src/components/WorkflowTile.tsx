import React, { useEffect, useState } from "react";
import { Workflow } from "@/types/workflow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WorkflowRun, WorkflowRunResponse } from "@/types/workflowRun";
import {
  formatDistanceToNow,
  formatDuration,
  intervalToDuration,
} from "date-fns";
import { useApi } from "@/hooks/use-api";
import { ControlBar } from "@/components/ControlBar";

interface WorkflowTileProps {
  workflow: Workflow;
}

const WorkflowTile: React.FC<WorkflowTileProps> = ({ workflow }) => {
  const { isLoading, error, request } = useApi();
  const [lastRun, setLastRun] = useState<WorkflowRun | null>(null);

  useEffect(() => {
    const fetchLastRun = async () => {
      try {
        const response = await request<WorkflowRunResponse>(
          `${workflow.url}/runs?per_page=1`,
        );
        setLastRun(response.workflow_runs[0] || null);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchLastRun();
  }, [workflow.url, request]);

  const refresh = async () => {
    try {
      const response = await request<WorkflowRunResponse>(
        `${workflow.url}/runs?per_page=1`,
      );
      setLastRun(response.workflow_runs[0] || null);
    } catch (error: unknown) {
      console.error(error);
    }
  };

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
      className={`relative flex flex-col text-center gap-0 py-0 w-64 h-40 ${getStatusClass()}`}
    >
      <CardHeader className="">
        <ControlBar
          onRefresh={refresh}
          workflowUrl={lastRun === null ? workflow.html_url : lastRun!.html_url}
        />
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-1">
        {!isLoading && !error && (
          <>
            <h3 className="text-lg font-bold leading-tight">{workflow.name}</h3>
            {lastRun ? (
              <>
                <p className="text-sm leading-tight">
                  {formatDistanceToNow(new Date(lastRun.created_at), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-sm leading-tight">
                  {lastRun.status} ({lastRun.conclusion || "N/A"})
                </p>
                <p className="text-sm leading-tight">
                  Duration: {getDuration()}
                </p>
              </>
            ) : (
              <p className="text-sm">No runs available</p>
            )}
          </>
        )}
        {isLoading && <p className="text-sm text-blue-600">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </CardContent>
    </Card>
  );
};

export default WorkflowTile;
