---
name: native-nodejs-programming
description: Use this skill whenever creating, reviewing, or modifying a native Node.js TypeScript app without frameworks, bundlers, transpilers, or build steps.
---


# Native Node.js Programming

Use this skill for native Node.js apps written in TypeScript and executed directly by Node.js.

Target runtime: **Node.js 24+**.

## NodeJS Internal Modules APIs

If you are not fully confident with the usage of a API, reference its documentation.
The documentation can be found in [./apis.md](./apis.md)

## Hard rules

* Use native Node.js APIs first.
* Use strict ESM.
* `package.json` must have `"type": "module"`.
* Use Node.js built-in TypeScript type stripping.
* Do not add `tsx`, `ts-node`, Babel, SWC, esbuild, Vite, or bundlers unless a human explicitly asks.
* Only add `@types/node` for Node typings.
* Do not add unnecessary runtime dependencies.
* Use `node:test` for tests.
* Do not use CommonJS unless a human explicitly asks.
* Do not use `require`, `module.exports`, `exports`, `__dirname`, or `__filename`.
* Do not use TypeScript `paths`.
* Use `package.json` `"imports"` with `#` aliases instead.
* Use exact `.ts` import extensions.
* Never rewrite `.ts` imports to `.js` when the project runs TypeScript source directly.
* Do not use unstable Node.js APIs unless a human explicitly allows it.
* Do not install "typescript" as a dependency unless the project needs to run `tsc --noEmit` for type checking or transformation features.
* Prefer IDE LSP type checking.
* If IDE LSP is not available, use `tsc --noEmit` for type checking.

## Stability rule

Before using a Node.js API, check its stability level.

* Stability 2 / Stable: allowed.
* Stability 1.x / Experimental / Early development / Release candidate: do not use unless a human explicitly allows it.
* Deprecated APIs: do not use.

## Required package.json baseline

```json
{
  "type": "module",
  "engines": {
    "node": ">=24"
  },
  "enginesStrict": true,
  "scripts": {
    "check": "tsc --noEmit",
    "test": "node --test",
    "dev": "node --watch src/index.ts",
    "start": "node src/index.ts"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

## Required tsconfig.json baseline

```jsonc
{
  "include": [
    "src/**/*.ts",
    "test/**/*.ts"
  ],
  "compilerOptions": {
    "types": ["node"],
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

Adjust `include` only to cover actual project files.

## Node.js TypeScript behavior

Node.js runs TypeScript by stripping erasable types.

Important consequences:

* Node.js does not type-check TypeScript.
* `tsc --noEmit` is still required for type checking.
* Node.js ignores `tsconfig.json` at runtime.
* Features that require TypeScript transformation are unsupported.
* `.tsx` files are unsupported.
* TypeScript files inside `node_modules` are not handled by Node.js type stripping.

Do not use TypeScript features that require code generation:

* no `enum`
* no runtime `namespace`
* no parameter properties
* no decorators
* no import aliases

Use `import type` for type-only imports.

```ts
import type { Config } from "./config.ts";
import { loadConfig, type LoadConfigOptions } from "./config.ts";
```

Do not write type imports as value imports.

```ts
// Bad
import { Config } from "./config.ts";
```

## ESM and imports

Relative imports must include exact file extensions.

```ts
import { createServer } from "node:http";
import { loadConfig } from "./config.ts";
```

Do not omit extensions.

```ts
// Bad
import { loadConfig } from "./config";
```

Do not convert TypeScript source imports to `.js`.

```ts
// Bad for direct Node.js TypeScript source execution
import { loadConfig } from "./config.js";
```

## Internal aliases

Never use `compilerOptions.paths`.

```jsonc
// Bad
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Use `package.json` `"imports"` instead. Entries must start with `#`.

```json
{
  "imports": {
    "#lib/*.ts": "./src/lib/*.ts",
    "#config.ts": "./src/config.ts"
  }
}
```

Then import with:

```ts
import { parseEnv } from "#lib/parse-env.ts";
import { config } from "#config.ts";
```

## Package exports/imports basics

Use `"exports"` to define public package entry points.

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Use `"imports"` for private internal aliases.

```json
{
  "imports": {
    "#internal/*.ts": "./src/internal/*.ts"
  }
}
```

Rules:

* `"imports"` keys must start with `#`.
* `"exports"` targets must start with `./`.
* Do not use path traversal like `../`.
* Prefer explicit, small maps over clever aliasing.
* Avoid dual ESM/CommonJS package setups unless a human explicitly asks.

## Testing

Use the built-in `node:test` module and `node:assert/strict`.

```ts
import test from "node:test";
import assert from "node:assert/strict";

test("adds numbers", () => {
  assert.equal(1 + 1, 2);
});
```

`node:test` is stable.

Run tests with:

```bash
node --test
```

Node.js will discover TypeScript test files when type stripping is enabled.

Common test names:

```txt
test/**/*.test.ts
**/*.test.ts
**/*-test.ts
**/*_test.ts
```

## Subtests

Await subtests. Otherwise the parent test may finish first and cancel them.

```ts
import test from "node:test";
import assert from "node:assert/strict";

test("parent", async (t) => {
  await t.test("child", () => {
    assert.equal(1, 1);
  });
});
```

## Test mocks

Prefer the test context mock API because it is automatically restored after the test.

```ts
import test from "node:test";
import assert from "node:assert/strict";

test("mocks a function", (t) => {
  const fn = t.mock.fn((a: number, b: number) => a + b);

  assert.equal(fn(2, 3), 5);
  assert.equal(fn.mock.callCount(), 1);
});
```

## Timer mocks

Use `context.mock.timers`.

```ts
import test from "node:test";
import assert from "node:assert/strict";

test("mocks timers", (t) => {
  const fn = t.mock.fn();

  t.mock.timers.enable({ apis: ["setTimeout", "Date"] });

  setTimeout(fn, 1000);

  assert.equal(fn.mock.callCount(), 0);
  assert.equal(Date.now(), 0);

  t.mock.timers.tick(1000);

  assert.equal(fn.mock.callCount(), 1);
  assert.equal(Date.now(), 1000);
});
```

Do not destructure timer functions from `node:timers` when using mocked timers.

```ts
// Avoid with mock timers
import { setTimeout } from "node:timers";
```

Use namespace imports if needed:

```ts
import timers from "node:timers";
```

## Avoid unstable test APIs by default

Do not use these unless a human explicitly allows:

* `node --test --watch`
* `--experimental-test-coverage`
* `--test-global-setup`
* `mock.module`
* `--experimental-test-module-mocks`
* any other API marked Stability 1.x

## Minimal project shape

```txt
package.json
tsconfig.json
src/
  index.ts
  lib/
    greet.ts
test/
  greet.test.ts
```

## Minimal example

`package.json`:

```json
{
  "name": "native-node-app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24"
  },
  "imports": {
    "#lib/*.ts": "./src/lib/*.ts"
  },
  "scripts": {
    "check": "tsc --noEmit",
    "test": "node --test",
    "dev": "node --watch src/index.ts",
    "start": "node src/index.ts"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

`tsconfig.json`:

```jsonc
{
  "include": [
    "src/**/*.ts",
    "test/**/*.ts"
  ],
  "compilerOptions": {
    "types": ["node"],
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true,
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noEmit": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

`src/lib/greet.ts`:

```ts
export function greet(name: string): string {
  return `Hello, ${name}`;
}
```

`src/index.ts`:

```ts
import { greet } from "#lib/greet.ts";

console.log(greet("Node.js"));
```

`test/greet.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { greet } from "#lib/greet.ts";

test("greets by name", () => {
  assert.equal(greet("Node.js"), "Hello, Node.js");
});
```

## Review checklist

Verify:

* `package.json` has `"type": "module"`.
* Node engine is `>=24`.
* `@types/node` is present.
* `typescript` is present for `tsc --noEmit`.
* `tsconfig.json` uses `module: "nodenext"`.
* `tsconfig.json` uses `moduleResolution: "nodenext"`.
* `tsconfig.json` has `erasableSyntaxOnly: true`.
* `tsconfig.json` has `allowImportingTsExtensions: true`.
* `tsconfig.json` has `verbatimModuleSyntax: true`.
* `tsconfig.json` has `noEmit: true`.
* No `compilerOptions.paths`.
* Internal aliases use `package.json` `"imports"` with `#`.
* Relative imports include `.ts`.
* Type-only imports use `import type`.
* Tests use `node:test`.
* Test assertions use `node:assert/strict` or `t.assert`.
* No unstable Node.js APIs unless explicitly approved by a human.
