#!/usr/bin/env node

import { runCli } from "./runCli.js";
import { bold, red } from "../ui/colors.js";
import { CROSS } from "../ui/fmt.js";

try {
  await runCli();
} catch (err) {
  const message =
    err instanceof Error ? err.message : String(err);
  const lines = message.split("\n");
  const firstLine = lines[0] ?? "";
  const rest = lines.slice(1).join("\n");
  process.stderr.write(
    `\n${bold(red(CROSS))} ${bold(firstLine)}${rest ? "\n" + rest : ""}\n\n`,
  );
  process.exitCode = 2;
}
