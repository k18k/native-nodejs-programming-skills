# Native Node.js Programming

[![Node.js](https://img.shields.io/badge/Node-24%2B-brightgreen?logo=node.js\&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[![Build](https://img.shields.io/github/actions/workflow/status/k18k/native-nodejs-programming-skills/update-nodejs-skill.yml?branch=main&label=workflow)](https://github.com/k18k/native-nodejs-programming-skills/actions)

---

Use this skill when creating, reviewing, or modifying **native Node.js applications** written in TypeScript without frameworks, bundlers, or build steps.

**Target runtime:** Node.js 24+
**Type:** Native ESM + TypeScript (erasable type stripping)

---

## Overview

This skill enforces:

* Strict ESM modules
* Direct TypeScript execution
* Minimal dependencies
* Node.js built-in testing (`node:test`)
* Internal aliases using `package.json "imports"`
* Public entry points using `package.json "exports"`

---

## Quick Start

### Install

```bash
npm install
```

### Run

```bash
npm start
```

### Run Tests

```bash
npm test
```

---

## Project Layout

```
package.json
tsconfig.json
src/
  index.ts
  lib/
    greet.ts
test/
  greet.test.ts
skills/native-nodejs-programming/
  SKILL.md
  apis.md
```

---

## Example Internal Alias

`package.json`:

```json
{
  "imports": {
    "#lib/*.ts": "./src/lib/*.ts",
    "#config.ts": "./src/config.ts"
  }
}
```

Usage:

```ts
import { parseEnv } from "#lib/parse-env.ts";
import { config } from "#config.ts";
```

---

## Best Practices

* Prefer **native Node.js APIs** first
* Avoid **unstable APIs** unless explicitly approved
* Use `import type` for type-only imports
* Relative imports **must include `.ts`**
* Type-check with `tsc --noEmit`
* Use Node.js built-in `node:test` for tests and subtests
* Mock timers and functions using `t.mock.*`

---

## Minimal Baselines

`package.json`:

```json
{
  "type": "module",
  "engines": { "node": ">=24" },
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
  "include": ["src/**/*.ts", "test/**/*.ts"],
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

Do you want me to do that as well?
