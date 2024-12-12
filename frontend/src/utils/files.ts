/**
 * Pillow doesn't support certain image file types, so this is a list of common image types that
 * are supported by Pillow.  This list is used to set the `accept` attribute on file input elements
 * to only allow these types of files to be uploaded.
 */
export const commonImageTypes = 'image/bmp,image/gif,image/jpeg,image/png,image/tiff,image/webp';

/**
 * Determine if an uploaded file should be accepted based on it's type
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 */
export function isFileAccepted(accept: string, file: File) {
  const acceptedTypes = accept
    .toLowerCase()
    .split(',')
    .map((t) => t.trim());
  const fileType = file.type.toLowerCase();

  return acceptedTypes.some((type) => {
    // If file type is not recognized, do not accept it
    if (fileType === '') {
      return false;
    }

    // Handle explicit extensions such as '.jpg'
    if (type.startsWith('.')) {
      const acceptedExtension = type.slice(1);
      const fileExtension = file.name.toLowerCase().split('.').pop();

      return fileExtension === acceptedExtension;
    }

    // Handle mime type wildcards such as 'image/*'
    const wildcardTypes = ['image/*', 'audio/*', 'video/*'];
    if (wildcardTypes.includes(type)) {
      const category = fileType.split('/')[0];

      return type.startsWith(category);
    }

    // Handle specific mime types such as 'image/jpeg'
    return fileType === type;
  });
}
