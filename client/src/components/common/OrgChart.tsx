import { OrganizationNode } from "../../types";

type OrgChartProps = {
  nodes: OrganizationNode[];
};

const Branch = ({ node }: { node: OrganizationNode }) => {
  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-1 h-[calc(100%-0.5rem)] w-px bg-slate-300/70 dark:bg-slate-600/70" />
      <div className="absolute left-2 top-9 h-px w-4 bg-slate-300/70 dark:bg-slate-600/70" />
      <div className="card relative mb-4 p-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{node.name}</p>
        <p className="text-xs text-slate-500">
          {node.designation} • {node.department}
        </p>
      </div>
      {node.children.length ? (
        <div className="ml-4">
          {node.children.map((child) => (
            <Branch key={child.id || child._id} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const OrgChart = ({ nodes }: OrgChartProps) => {
  if (!nodes.length) {
    return <div className="card p-6 text-sm text-slate-500">No organization data yet.</div>;
  }

  return (
    <div className="space-y-4">
      {nodes.map((node) => (
        <Branch key={node.id || node._id} node={node} />
      ))}
    </div>
  );
};
