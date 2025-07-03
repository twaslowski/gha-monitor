import React from "react";
import { formatDuration } from "@/util/formatDuration";
import { WorkflowRun } from "@/types/workflowRun";

type Props = {
  results: WorkflowRun[];
};

export default function WorkflowRunsTable({ results }: Props) {
  return (
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
          {results.map((run) => {
            const start = run.created_at ? new Date(run.created_at) : null;
            const end = run.updated_at ? new Date(run.updated_at) : null;
            const duration =
              start && end
                ? Math.round((end.getTime() - start.getTime()) / 1000)
                : null;
            const conclusion = run.conclusion || run.status;
            let color = "";
            if (conclusion === "success") color = "bg-green-100 text-green-800";
            else if (conclusion === "failure")
              color = "bg-red-100 text-red-800";
            else if (conclusion === "startup_failure")
              color = "bg-red-100 text-red-800";
            else if (conclusion === "cancelled")
              color = "bg-yellow-100 text-yellow-800";
            else if (conclusion === "skipped")
              color = "bg-gray-100 text-gray-800";
            else color = "bg-blue-100 text-blue-800";
            return (
              <tr key={run.id} className="even:bg-black/5 dark:even:bg-white/5">
                <td className="p-2 border">{run.id}</td>
                <td className={`p-2 border font-semibold rounded ${color}`}>
                  {conclusion}
                </td>
                <td className="p-2 border">
                  {duration !== null ? formatDuration(duration) : "-"}
                </td>
                <td className="p-2 border">
                  {run.created_at
                    ? new Date(run.created_at).toLocaleString()
                    : "-"}
                </td>
                <td className="p-2 border">
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
