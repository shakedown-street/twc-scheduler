import { formatBytes } from '@/utils/format';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import './FileDropArea.scss';
import { FileUploadController } from './FileUploadController';

export type FileDropAreaProps = {
  accept?: string;
  maxFiles?: number;
  onChange?: (files: File[]) => void;
  showFileSize?: boolean;
  showImagePreview?: boolean;
};

export const FileDropArea = ({
  accept,
  maxFiles,
  onChange,
  showFileSize = true,
  showImagePreview,
}: FileDropAreaProps) => {
  return (
    <FileUploadController accept={accept} maxFiles={maxFiles} multiple onChange={onChange}>
      {({ dragProps, files, handleRemoveFile, openFileInput }) => (
        <div className="FileDropArea">
          <div className="FileDropArea__dropzone" {...dragProps}>
            <div className="FileDropArea__dropzone__info">
              <div className="text-weight-medium">Drop files here</div>
              <div className="text-size-sm">or</div>
              <Button onClick={openFileInput} size="xs" variant="outlined">
                Browse Files
              </Button>
            </div>
          </div>
          {files.length > 0 && (
            <ul className="FileDropArea__fileList">
              {files.map((file, index) => (
                <li className="FileDropArea__file" key={index}>
                  {showImagePreview && (
                    <img className="FileDropArea__file__preview" src={URL.createObjectURL(file)} alt={file.name} />
                  )}
                  <div className="FileDropArea__file__name">{file.name}</div>
                  {showFileSize && <div className="FileDropArea__file__size">{formatBytes(file.size, 1)}</div>}
                  <IconButton onClick={() => handleRemoveFile(index)} size="sm">
                    <span className="material-symbols-outlined">close</span>
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </FileUploadController>
  );
};
