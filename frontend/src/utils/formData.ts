export const convertToFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.keys(data)
    .filter((key) => data[key] !== undefined)
    .forEach((key) => {
      if (data[key] instanceof FileList && data[key].length > 0) {
        formData.append(key, data[key][0]);
      } else if (Array.isArray(data[key])) {
        data[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, data[key]);
      }
    });
  return formData;
};
