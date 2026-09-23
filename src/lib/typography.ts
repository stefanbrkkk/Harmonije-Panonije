/**
 * Serbian typesetting rule: one- and two-letter words (i, u, a, uz, sa, …)
 * never end a line — bind each to the following word with a no-break space.
 * An em dash stays with the word before it, so no line starts with "—".
 * Deterministic, so server and client markup match.
 */
const NBSP = "\u00a0";
// No lookbehind (unsupported before Safari 16.4, where it would be a parse
// error for every client chunk importing this module): the preceding
// boundary is captured instead, and a second pass binds adjacent short
// words ("i u …") whose boundary the first match consumed.
const SHORT = /(^|[\s\u00a0])(a|i|o|u|s|k|uz|sa|za|od|do|na|po|iz|ka|je|se)[ \t]/giu;

export function bindShortWords(text: string) {
  const bind = (value: string) => value.replace(SHORT, `$1$2${NBSP}`);
  return bind(bind(text)).replace(/ —/g, `${NBSP}—`);
}

/** Product names like "Cvekla · šargarepa · jabuka": a line never starts with "·". */
export function bindSeparators(text: string) {
  return text.replace(/ · /g, `${NBSP}· `);
}
