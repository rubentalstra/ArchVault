import type { NodeTypes } from "@xyflow/react";
import { ActorNode } from "./actor-node";
import { SystemNode } from "./system-node";
import { AppNodeComponent } from "./app-node";
import { StoreNode } from "./store-node";
import { ComponentNode } from "./component-node";
import { GroupNode } from "./group-node";

export const nodeTypes: NodeTypes = {
  actor: ActorNode,
  group: GroupNode,
  system: SystemNode,
  app: AppNodeComponent,
  store: StoreNode,
  component: ComponentNode,
};
