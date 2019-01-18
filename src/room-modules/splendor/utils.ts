export function shuffle<T>(array: T[], random = Math.random): T[] {
  let arr = array.slice(0)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr
}
