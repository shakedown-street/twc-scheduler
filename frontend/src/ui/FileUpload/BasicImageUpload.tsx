import genericPlaceholder from '@/assets/generic-placeholder.svg';
import { IconButton } from '../IconButton/IconButton';
import './BasicImageUpload.scss';
import { FileUploadController } from './FileUploadController';

export type BasicImageUploadProps = {
  initialSrc?: string;
  onChange?: (file: File) => void;
  onRemove?: () => void;
};

export const BasicImageUpload = ({ initialSrc, onChange, onRemove }: BasicImageUploadProps) => {
  function getSrc(files: File[]) {
    if (files.length > 0) {
      return URL.createObjectURL(files[0]);
    } else if (initialSrc) {
      return initialSrc;
    }
    return genericPlaceholder;
  }

  return (
    <FileUploadController accept="image/*" onChange={(files) => onChange?.(files[0])}>
      {({ dragProps, files, handleRemoveFile, openFileInput }) => (
        <div className="BasicImageUpload">
          <div className="BasicImageUpload__dropzone" {...dragProps}>
            <img alt="Preview" className="BasicImageUpload__preview" onClick={openFileInput} src={getSrc(files)} />
          </div>
          {(files.length > 0 || initialSrc) && (
            <IconButton
              className="BasicImageUpload__remove"
              color="red"
              onClick={() => {
                handleRemoveFile(0);
                onRemove?.();
              }}
              size="xs"
            >
              <span className="material-symbols-outlined">close</span>
            </IconButton>
          )}
        </div>
      )}
    </FileUploadController>
  );
};
