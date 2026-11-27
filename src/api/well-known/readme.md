# Well-known Endpoints

These are "API" endpoints but they need to live at the root of the application because that is the standard and we can't change that. Keeping them in the `/api` directory for consistency with our codebase but they are managed separately in the `src/worker.tsx` because it needs to mount these at the root.
