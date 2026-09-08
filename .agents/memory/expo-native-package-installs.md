---
name: Expo native package installs
description: Workspace-specific dependency installation behavior for Expo artifacts
---

Native Expo dependencies belong to the mobile artifact package, not the workspace root. When the generic package installer targets the root, use the workspace-scoped package-manager add command so the dependency and lockfile entry land in the Expo package.

**Why:** The generic installer can reject Expo dependencies with a workspace-root safety error even though the package is valid and compatible with the app's SDK.

**How to apply:** Keep the dependency in `artifacts/<mobile-app>/package.json`, then run the artifact's typecheck and restart its managed mobile workflow after dependency changes.