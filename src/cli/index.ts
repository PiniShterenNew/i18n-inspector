#!/usr/bin/env node

import { runCli } from "./runCli.js";

try {
  await runCli();
} catch (err) {
  const message =
    err instanceof Error ? err.message : String(err);
  process.stderr.write(`\nError: ${message}\n\n`);
  process.exitCode = 2;
}
