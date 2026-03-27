# Third-Party Fixture Notice

This directory is reserved for third-party fixture files with explicit, commit-safe licensing.

## Requirements

- Every third-party fixture file must be listed in `docs/fixture-provenance.json`.
- Every provenance entry must reference a source ID from `docs/test-fixture-sources.json`.
- Third-party fixtures are only allowed when the linked source has one of these statuses:
  - `safe_to_vendor`
  - `safe_to_vendor_with_exclusions`

## Current state

No third-party fixtures are currently vendored in this directory.
