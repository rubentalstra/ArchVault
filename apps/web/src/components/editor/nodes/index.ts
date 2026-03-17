import type { NodeTypes } from "@xyflow/react";
import { ActorNode } from "./actor-node";
import { SystemNode } from "./system-node";
import { AppNodeComponent } from "./app-node";
import { StoreNode } from "./store-node";
import { ComponentNode } from "./component-node";

export const nodeTypes: NodeTypes = {
  actor: ActorNode,
  system: SystemNode,
  app: AppNodeComponent,
  store: StoreNode,
  component: ComponentNode,
};
