import { validateWorkflowPair } from "../src/workflow-factory/validator";

const workflowId = process.argv[2];
if (!workflowId) {
  console.error("usage: node --import tsx scripts/workflow-factory.ts <workflow-id>");
  process.exit(1);
}

const specPath = `specs/${workflowId}.yaml`;
const workflowPath = `workflows/${workflowId}.json`;

const result = await validateWorkflowPair(specPath, workflowPath);
if (!result.ok) {
  console.error(`Workflow validation failed for '${workflowId}':`);
  for (const error of result.errors) {
    console.error(` - ${error}`);
  }
  process.exit(1);
}

console.log(`Workflow validation passed for '${workflowId}'.`);
