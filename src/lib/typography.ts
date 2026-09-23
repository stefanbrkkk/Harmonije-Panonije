/**
 * Serbian typesetting rule: one- and two-letter words (i, u, a, uz, sa, …)
 * never end a line — bind each to the following word with a no-break space.
 * Deterministic, so server and client markup match.
 */
const SHORT = /(?<=^|[\s ])(a|i|o|u|s|k|uz|sa|za|od|do|na|po|iz|ka|je|se|—)\s/giu;

export function bindShortWords(text: string) {
  return text.replace(SHORT, "$1 ");
}
