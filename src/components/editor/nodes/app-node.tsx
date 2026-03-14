import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Package } from "lucide-react";
import type { AppNodeData } from "#/lib/types/diagram-nodes";
import { m } from "#/paraglide/messages";
import { StatusDot } from "./status-dot";
import { TechIcon } from "#/components/technologies/tech-icon";

function AppNodeComponentInner({ data, selected }: NodeProps & { data: AppNodeData }) {
  return (
    <>
      <Handle id="top-target" type="target" position={Position.Top} className="!size-2 !border-primary !bg-primary" />
      <Handle id="top-source" type="source" position={Position.Top} className="!size-2 !border-primary !bg-primary" />
      <Handle id="bottom-target" type="target" position={Position.Bottom} className="!size-2 !border-primary !bg-primary" />
      <Handle id="bottom-source" type="source" position={Position.Bottom} className="!size-2 !border-primary !bg-primary" />
      <Handle id="left-target" type="target" position={Position.Left} className="!size-2 !border-primary !bg-primary" />
      <Handle id="left-source" type="source" position={Position.Left} className="!size-2 !border-primary !bg-primary" />
      <Handle id="right-target" type="target" position={Position.Right} className="!size-2 !border-primary !bg-primary" />
      <Handle id="right-source" type="source" position={Position.Right} className="!size-2 !border-primary !bg-primary" />

      <div
        className={`flex w-52 flex-col items-center gap-1 rounded-lg border-2 bg-card px-5 py-4 text-card-foreground shadow-sm ${
          data.external ? "border-dashed border-muted-foreground" : "border-border"
        } ${selected ? "ring-2 ring-primary" : ""}`}
      >
        <div className="flex w-full items-center gap-2.5">
          {data.iconTechSlug ? (
            <TechIcon slug={data.iconTechSlug} className="size-7 shrink-0" fallback={<Package className="size-7 shrink-0 text-foreground" />} />
          ) : (
            <Package className="size-7 shrink-0 text-foreground" />
          )}
          <span className="truncate text-base font-bold">{data.name}</span>
          <StatusDot status={data.status} />
        </div>
        {data.displayDescription && (
          <span className="line-clamp-2 w-full text-center text-xs text-muted-foreground">
            {data.displayDescription}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {data.technologies.length > 0
            ? `${m.element_type_app()}: ${data.technologies.join(", ")}`
            : m.element_type_app()}
        </span>
        {data.external && (
          <span className="text-[10px] text-muted-foreground">{m.canvas_node_external()}</span>
        )}
      </div>
    </>
  );
}

export const AppNodeComponent = memo(AppNodeComponentInner);
