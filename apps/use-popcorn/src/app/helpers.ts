export const average = (arr: number[]): number =>
  arr.reduce((acc, cur) => acc + cur / arr.length, 0);
