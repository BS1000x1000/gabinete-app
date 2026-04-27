export function toggleInArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(e => e !== item) : [...arr, item];
}
