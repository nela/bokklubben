export function formatCaps(title: string): string {
  function lower(word: string): string {
    return word.toLowerCase();
  }

  function upper(word: string): string {
    return word.substr(0, 1).toUpperCase() + word.substr(1);
  }

  let small =
    '(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)';
  let punct = '([!"#$%&\'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)';
  let parts = [];
  let split = /[:.;?!]|(?: |^)["Ò]/g;
  let index = 0;

  while (true) {
    var m = split.exec(title);

    parts.push(
      title
        .substring(index, m ? m.index : title.length)
        .replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, (all: string): string => {
          return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
        })
        .replace(RegExp('\\b' + small + '\\b', 'ig'), lower)
        .replace(
          RegExp('^' + punct + small + '\\b', 'ig'),
          (all, punct, word): string => {
            return punct + upper(word);
          }
        )
        .replace(RegExp('\\b' + small + punct + '$', 'ig'), upper)
    );

    index = split.lastIndex;

    if (m) parts.push(m[0]);
    else break;
  }

  return parts
    .join('')
    .trim()
    .replace(/\s+/g, ' ') // Removes multiple space insertions
    .replace(/^\s+|\s+$/, '') // Removes multiple space insertions
    .replace(/ V(s?)\. /gi, ' v$1. ')
    .replace(/(['Õ])S\b/gi, '$1s')
    .replace(/\b(AT&T|Q&A)\b/gi, (all: string): string => {
      return all.toUpperCase();
    });
}
