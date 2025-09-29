export function orderByFirstName<T extends { first_name: string }>(list: T[]): T[] {
  return list.sort((a: T, b: T) => {
    if (a.first_name < b.first_name) {
      return -1;
    }
    if (a.first_name > b.first_name) {
      return 1;
    }
    return 0;
  });
}
