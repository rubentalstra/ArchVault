import type { NodeTypes } from "@xyflow/react";
import { PersonNode } from "./person-node";
import { SystemNode } from "./system-node";
import { ContainerNode } from "./container-node";
import { ComponentNode } from "./component-node";
import { GroupNode } from "./group-node";

export const nodeTypes: NodeTypes = {
  person: PersonNode,
  system: SystemNode,
  container: ContainerNode,
  component: ComponentNode,
  group: GroupNode,
};
