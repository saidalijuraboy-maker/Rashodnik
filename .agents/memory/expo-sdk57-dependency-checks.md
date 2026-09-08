---
name: Expo SDK 57 diagnostics
description: Dependency-alignment and doctor behavior specific to the Expo SDK 57 workspace setup.
---

For this workspace's Expo SDK 57 projects, the local Expo CLI can report that `expo doctor` is unsupported even when Metro starts normally. The standalone `expo-doctor` package is the authoritative compatibility check in that case.

**Why:** Expo SDK 57's local CLI delegates doctor functionality out of the CLI, and the workspace package firewall can temporarily reject same-day official Expo releases needed by the SDK's expected-version matrix.

**How to apply:** Use the workspace filter for installs, keep the minimum-release-age policy enabled, and run the standalone doctor after dependency installation. Any temporary allowlist entry for a trusted Expo release must be removed after installation.