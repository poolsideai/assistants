export const COMMIT_SUBJECT_CHARACTER_LIMIT = 50;

export function commitSubjectCharactersRemaining(message: string): number {
  const lineBreak = message.search(/[\r\n]/);
  const subject = lineBreak === -1 ? message : message.slice(0, lineBreak);
  return COMMIT_SUBJECT_CHARACTER_LIMIT - Array.from(subject).length;
}
