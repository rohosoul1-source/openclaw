import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

type SpecLike = {
  id?: string;
  version?: string;
  nodes?: Array<{ id?: string; kind?: string }>;
  tests?: Array<{ fixture?: string; assertions?: string }>;
};

type WorkflowLike = {
  meta?: { specId?: string; specVersion?: string };
  nodes?: Array<{ id?: string; credentials?: Record<string, { id?: string }> }>;
};

export async function validateWorkflowPair(
  specPath: string,
  workflowPath: string,
): Promise<ValidationResult> {
  const errors: string[] = [];

  const [specRaw, workflowRaw] = await Promise.all([
    fs.readFile(specPath, "utf8"),
    fs.readFile(workflowPath, "utf8"),
  ]);

  const spec = YAML.parse(specRaw) as SpecLike;
  const workflow = JSON.parse(workflowRaw) as WorkflowLike;

  if (!spec.id || !workflow.meta?.specId || workflow.meta.specId !== spec.id) {
    errors.push("workflow.meta.specId must match spec.id");
  }

  if (!spec.version || !workflow.meta?.specVersion || workflow.meta.specVersion !== spec.version) {
    errors.push("workflow.meta.specVersion must match spec.version");
  }

  const specNodeIds = new Set((spec.nodes ?? []).map((node) => node.id));
  for (const node of workflow.nodes ?? []) {
    if (!node.id || !specNodeIds.has(node.id)) {
      errors.push(`workflow node id '${node.id ?? "<missing>"}' missing from spec.nodes`);
    }

    // Credentials must be references only. Secrets are injected at deployment time.
    for (const credential of Object.values(node.credentials ?? {})) {
      if (!credential?.id?.startsWith("CRED_")) {
        errors.push(`credential reference on node '${node.id}' must use CRED_* placeholder ids`);
      }
    }
  }

  for (const testCase of spec.tests ?? []) {
    if (!testCase.fixture || !testCase.assertions) {
      errors.push("spec tests must define fixture and assertions paths");
      continue;
    }

    const fixturePath = path.resolve(path.dirname(specPath), "..", testCase.fixture);
    const assertionsPath = path.resolve(path.dirname(specPath), "..", testCase.assertions);
    try {
      await fs.access(fixturePath);
    } catch {
      errors.push(`missing fixture file: ${testCase.fixture}`);
    }
    try {
      await fs.access(assertionsPath);
    } catch {
      errors.push(`missing assertions file: ${testCase.assertions}`);
    }
  }

  return { ok: errors.length === 0, errors };
}
