// Serialize file writes to prevent race conditions
let fileWriteLock = Promise.resolve();

export function withFileLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = fileWriteLock.then(fn, fn);
  fileWriteLock = next.then(() => {}, () => {});
  return next;
}
