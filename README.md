# RedwoodSDK Minimal Starter

This is the starter project for RedwoodSDK. It's a template designed to get you up and running as quickly as possible.

Create your new project:

```shell
npx create-rwsdk my-project-name
cd my-project-name
npm install
```

## Running the dev server

```shell
npm run dev
```

Point your browser to the URL displayed in the terminal (e.g. `http://localhost:5173/`). You should see the RedwoodSDK welcome page in your browser.

## Resetting the local D1 database

Each `pnpm docker:up` run recreates the local ATP accounts with new DIDs. Since the D1 statuses table is keyed by DID, restarting the docker setup leaves stale rows behind. Clear the local Miniflare state and re-run migrations to start fresh:

```sh
rm -rf .wrangler/state/v3/d1 && pnpm db:apply-migrations-local
```

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
