export function shouldLoadFamilyDailyLifeTools(opened: boolean, lowDataMode: boolean) {
  return opened && !lowDataMode;
}
