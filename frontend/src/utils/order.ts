export function orderByFirstName<T>(list: T[]): T[] {
  return list.sort((a: any, b: any) => {
    if (a.first_name < b.first_name) {
      return -1;
    }
    if (a.first_name > b.first_name) {
      return 1;
    }
    return 0;
  });
}
