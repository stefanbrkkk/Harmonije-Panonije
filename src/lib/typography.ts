/**
 * Serbian typesetting rule: one- and two-letter words (i, u, a, uz, sa, …)
 * never end a line — bind each to the following word with a no-break space.
 * An em dash stays with the word before it, so no line starts with "—".
 * Deterministic, so server and client markup match.
 */
const NBSP = "\u00a0";
const SHORT = /(?<=^|[\s\u00a0])(a|i|o|u|s|k|uz|sa|za|od|do|na|po|iz|ka|je|se)\s/giu;

export function bindShortWords(text: string) {
  return text.replace(SHORT, `$1${NBSP}`).replace(/ —/g, `${NBSP}—`);
}

/** Product names like "Cvekla · šargarepa · jabuka": a line never starts with "·". */
export function bindSeparators(text: string) {
  return text.replace(/ · /g, `${NBSP}· `);
}
