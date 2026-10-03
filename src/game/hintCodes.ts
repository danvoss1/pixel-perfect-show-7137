const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function fnv1a(value: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

export function hintCodeFor(puzzleId: string, hintId: string) {
  let value = fnv1a(`hidden-path-hint-v1::${puzzleId}::${hintId}`);
  let code = "";

  for (let index = 0; index < 6; index += 1) {
    code += ALPHABET[value % ALPHABET.length];
    value = Math.imul(value ^ (value >>> 13), 1597334677) >>> 0;
  }

  return `HP-${code.slice(0, 3)}-${code.slice(3)}`;
}

export function normalizeHintCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function isHintCodeValid(
  puzzleId: string,
  hintId: string,
  candidate: string,
) {
  return (
    normalizeHintCode(candidate) ===
    normalizeHintCode(hintCodeFor(puzzleId, hintId))
  );
}
