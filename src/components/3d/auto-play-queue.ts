export const autoPlayQueue: string[] = [];
export function queueAutoPlayNote(note: string) {
  autoPlayQueue.push(note);
}
