// ── Connection enums & types ────────────────────────────────────────

export const CONNECTION_DIRECTIONS = ["outgoing", "incoming", "bidirectional", "none"] as const;
export type ConnectionDirection = (typeof CONNECTION_DIRECTIONS)[number];

// ── Endpoint validation ─────────────────────────────────────────────

export function validateConnectionEndpoints(
  sourceId: string,
  targetId: string,
): { valid: boolean; message?: string } {
  if (sourceId === targetId) {
    return { valid: false, message: "Source and target cannot be the same element." };
  }
  return { valid: true };
}
