# Harbor — Test Credentials

No authentication is used. Harbor is a frontend-only app and all data lives in the
browser via localStorage (no backend, no accounts).

- Open the preview URL → choose a "sky" mood → tap **Set Sail** to reach the dashboard.
- First load auto-seeds ~6 example tasks (localStorage flag `harbor.seeded.v1`).
- To reset to a clean state: clear localStorage keys `harbor.tasks.v1`,
  `harbor.projects.v1`, `harbor.seeded.v1`.
