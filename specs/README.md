# Workflow Factory Scaffolding

This directory is the source of truth for workflow intent and validation contracts.

## Layout

- `specs/*.yaml`: workflow specs (human-authored source)
- `workflows/*.json`: generated n8n workflows (import artifacts)
- `tests/workflows/*`: dry-run test cases and assertions
- `fixtures/*`: sample request payloads and mocked responses
- `policies/*.json`: risk and approval rules

## Lifecycle

1. Author or update a spec in `specs/`.
2. Generate/update the corresponding `workflows/<id>.json`.
3. Validate pair consistency with:
   - `node --import tsx scripts/workflow-factory.ts <workflow-id>`
4. Run automated tests before deployment.

## Current seed workflow

- `intake-triage-route` (Hard task #1) with confidence gate and clarifier branch.
