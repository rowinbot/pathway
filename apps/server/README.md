# Pathway Server

## Adding a package from the mono-repo

TL;DR - Add the package with version `workspace:*` and include the package's name in the `noExternal` list in `apps/server/tsup.config.js`.

1. Add the package to the `apps/server/package.json` file as a dependency / devDependency with the version pointing to `workspace:*`.
2. Run `pnpm install` either from the root or from the project's directory. Pnpm _will know_ what to do.
3. Add the package to the `noExternal` list in `apps/server/tsup.config.js` to make sure to bundle it with the server. (server is cjs and monorepo packages are esm, as they're "external" deps they are not bundled by default, unless you do this, otherwise you'll most likely get a Syntax Error when importing them).
