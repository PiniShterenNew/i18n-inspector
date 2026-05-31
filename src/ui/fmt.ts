import { bold, cyan, gray } from "./colors.js";

const WIDTH = 46;

export const DIVIDER = gray("─".repeat(WIDTH));

export function box(lines: string[]): string {
  const inner = WIDTH - 2;
  const top    = "╭" + "─".repeat(inner) + "╮";
  const bottom = "╰" + "─".repeat(inner) + "╯";
  const rows = lines.map((line) => {
    const visible = stripAnsi(line);
    const pad = inner - visible.length;
    const left  = Math.floor(pad / 2);
    const right = pad - left;
    return "│" + " ".repeat(left) + line + " ".repeat(right) + "│";
  });
  return [top, ...rows, bottom].join("\n");
}

export function header(): string {
  return box([
    "",
    bold(cyan("i18n-inspector")),
    "Translation Audit Toolkit",
    "",
  ]);
}

export const CHECK   = "✔";
export const CROSS   = "✗";
export const BULLET  = "·";

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}
