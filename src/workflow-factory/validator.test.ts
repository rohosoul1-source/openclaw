import path from "node:path";
import { describe, expect, it } from "vitest";
import { validateWorkflowPair } from "./validator";

describe("workflow factory validator", () => {
  it("validates the intake-triage-route spec/workflow pair", async () => {
    const root = process.cwd();
    const result = await validateWorkflowPair(
      path.join(root, "specs/intake-triage-route.yaml"),
      path.join(root, "workflows/intake-triage-route.json"),
    );

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
