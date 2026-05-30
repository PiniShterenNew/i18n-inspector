const NO_COLOR =
  process.env["NO_COLOR"] !== undefined ||
  process.env["TERM"] === "dumb" ||
  !process.stdout.isTTY;

function ansi(code: number, reset: number) {
  return (text: string): string =>
    NO_COLOR ? text : `\x1b[${code}m${text}\x1b[${reset}m`;
}

export const cyan    = ansi(36, 39);
export const green   = ansi(32, 39);
export const yellow  = ansi(33, 39);
export const red     = ansi(31, 39);
export const blue    = ansi(34, 39);
export const gray    = ansi(90, 39);
export const bold    = ansi(1,  22);
export const dim     = ansi(2,  22);
