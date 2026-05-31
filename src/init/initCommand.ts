import { detectLocaleRoots } from "./detectLocaleRoots.js";
import { buildConfig } from "./buildConfig.js";
import { writeConfig } from "./writeConfig.js";
import { bold, cyan, green, red, dim } from "../ui/colors.js";
import { DIVIDER, CHECK, CROSS, header } from "../ui/fmt.js";

export async function initCommand(): Promise<void> {
  console.log("");
  console.log(header());
  console.log("");

  console.log(`${green(CHECK)} Detecting translation structure...`);

  const candidates = await detectLocaleRoots(process.cwd());

  if (candidates.length === 0) {
    console.log("");
    console.log(`${red(CROSS)} No locale structure detected.`);
    console.log("");
    console.log("  Expected one of:");
    console.log("");
    console.log(dim("  file-per-locale:"));
    console.log("    messages/");
    console.log("      en.json");
    console.log("      he.json");
    console.log("");
    console.log(dim("  locale-directories:"));
    console.log("    messages/");
    console.log("      en/");
    console.log("        common.json");
    console.log("      he/");
    console.log("        common.json");
    console.log("");
    console.log("  At least two locale files or directories are required.");
    console.log("");
    console.log("  You can also create i18n-inspector.config.json manually.");
    console.log(`  See: ${cyan("https://github.com/PiniShterenNew/i18n-inspector#configuration")}`);
    console.log("");
    process.exitCode = 1;
    return;
  }

  if (candidates.length > 1) {
    console.log("");
    console.log(`${red(CROSS)} Multiple locale roots found.`);
    console.log("");
    console.log("  i18n-inspector found more than one set of translation files:");
    console.log("");
    for (const c of candidates) {
      console.log(`    ${cyan(c.path)}  ${dim(`(${c.structure})`)}`);
    }
    console.log("");
    console.log("  Create i18n-inspector.config.json manually and set localesPath");
    console.log("  to the directory you want to audit:");
    console.log("");
    console.log('    {');
    console.log('      "structure": "file-per-locale",');
    console.log('      "localesPath": "./messages",');
    console.log('      "sourceLocale": "en",');
    console.log('      "targetLocales": ["he", "ar"]');
    console.log('    }');
    console.log("");
    process.exitCode = 1;
    return;
  }

  const candidate = candidates[0]!;

  let config;
  try {
    config = buildConfig(candidate);
  } catch {
    console.log("");
    console.log(`${red(CROSS)} Could not determine source locale.`);
    console.log("");
    console.log("  i18n-inspector could not identify which locale is the source.");
    console.log("  It automatically selects \"en\" as the source when present.");
    console.log("");
    console.log("  Locales found:");
    for (const locale of candidate.locales) {
      console.log(`    ${cyan(locale)}`);
    }
    console.log("");
    console.log("  Create i18n-inspector.config.json manually and set sourceLocale:");
    console.log("");
    console.log('    {');
    console.log(`      "structure": "${candidate.structure}",`);
    console.log(`      "localesPath": "${candidate.path}",`);
    console.log(`      "sourceLocale": "${candidate.locales[0] ?? "en"}",`);
    console.log(
      `      "targetLocales": [${candidate.locales
        .slice(1)
        .map((l) => `"${l}"`)
        .join(", ")}]`,
    );
    console.log('    }');
    console.log("");
    process.exitCode = 1;
    return;
  }

  console.log(`${green(CHECK)} Found locale root: ${cyan(candidate.path)}`);
  console.log(`${green(CHECK)} Detected source locale: ${cyan(config.sourceLocale)}`);
  console.log(`${green(CHECK)} Detected target locales: ${cyan(config.targetLocales.join(", "))}`);

  const configPath = await writeConfig(process.cwd(), config);

  const displayPath = configPath
    .replace(/\\/g, "/")
    .replace(process.cwd().replace(/\\/g, "/") + "/", "./");

  console.log("");
  console.log(DIVIDER);
  console.log("");
  console.log(bold(green("Configuration created successfully")));
  console.log("");
  console.log("File:");
  console.log(`  ${cyan(displayPath)}`);
  console.log("");
  console.log(bold(cyan("Next step:")));
  console.log("");
  console.log(`  ${bold("npx i18n-inspector")}`);
  console.log("");
  console.log(DIVIDER);
  console.log("");
}
