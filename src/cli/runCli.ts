import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

import { loadLocales } from "../check/loadLocales.js";
import {
  runCheck,
  type LocaleCheckResult,
} from "../check/runCheck.js";
import { loadConfig } from "../config/loadConfig.js";
import { initCommand } from "../init/initCommand.js";
import { createReportData } from "../report/createReportData.js";
import { generateHtmlReport } from "../report/htmlReport.js";
import { printReport } from "../report/printReport.js";
import { bold, cyan, dim, green } from "../ui/colors.js";
import { DIVIDER, CHECK, header } from "../ui/fmt.js";

const require = createRequire(import.meta.url);

function getVersion(): string {
  try {
    const pkg = require("../../package.json") as { version: string };
    return pkg.version;
  } catch {
    return "0.0.0";
  }
}

function makeReportFilename(date: Date): string {
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  return `i18n-inspector-report-${y}-${mo}-${d}-${h}${mi}.html`;
}

const VERSION = getVersion();

const HELP = `
${header()}
  ${dim(`v${VERSION}`)}

${bold("Quick Start:")}

  ${bold(cyan("npx i18n-inspector init"))}
  ${bold(cyan("npx i18n-inspector"))}
  ${bold(cyan("npx i18n-inspector --html"))}

${bold("Commands:")}

  i18n-inspector              Run audit against all target locales
  i18n-inspector init         Auto-detect locale structure and create config
  i18n-inspector --html       Run audit and generate HTML report
  i18n-inspector --help       Show this help message

${bold("Examples:")}

  # First-time setup
  npx i18n-inspector init

  # Run audit
  npx i18n-inspector

  # Run audit and save the HTML report
  npx i18n-inspector --html

${bold("Exit codes:")}

  0   All checks passed
  1   Issues found (missing / empty / placeholder mismatch)
  2   System error (config not found, file unreadable, etc.)

${bold("Config file:")} i18n-inspector.config.json

  {
    "structure":    "file-per-locale" | "locale-directories",
    "localesPath":  "./messages",
    "sourceLocale": "en",
    "targetLocales": ["he", "ar"]
  }

${bold("Docs:")} https://github.com/PiniShterenNew/i18n-inspector
`;

export async function runCli(
  args = process.argv.slice(2),
  cwd = process.cwd(),
): Promise<void> {
  const command = args[0];

  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }

  switch (command) {
    case "init":
      await initCommand();
      break;

    default: {
      const htmlFlag = args.includes("--html");

      const config = await loadConfig(cwd);
      const locales = await loadLocales(config, cwd);
      const results = await runCheck(config, locales);
      const report = createReportData(results, VERSION);

      printReport(report);

      if (htmlFlag) {
        const now = new Date(report.generatedAt);
        const filename = makeReportFilename(now);
        const reportsDir = join(cwd, "reports");
        const outPath = join(reportsDir, filename);

        await mkdir(reportsDir, { recursive: true });
        const html = generateHtmlReport(report);
        await writeFile(outPath, html, "utf8");
        console.log(DIVIDER);
        console.log("");
        console.log(`${green(CHECK)} ${bold("HTML report generated")}`);
        console.log("");
        console.log(`  ${bold("Open:")}  ${bold(cyan(`./reports/${filename}`))}`);
        console.log("");
        console.log(DIVIDER);
        console.log("");
      }

      process.exitCode = hasFailedChecks(results) ? 1 : 0;
    }
  }
}

export function hasFailedChecks(
  results: LocaleCheckResult[],
): boolean {
  return results.some(
    (result) =>
      result.missing > 0 ||
      result.empty > 0 ||
      result.placeholderMismatch > 0,
  );
}
