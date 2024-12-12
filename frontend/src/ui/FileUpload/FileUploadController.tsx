import React from 'react';
import { isFileAccepted } from '~/utils/files';
import { useToast } from '../Toaster/ToastContext';

export type FileUploadControllerRenderProps = {
  dragProps: {
    onDragOver: (e: React.DragEvent<any>) => void;
    onDrop: (e: React.DragEvent<any>) => void;
  };
  files: File[];
  handleRemoveFile: (index: number) => void;
  openFileInput: () => void;
};

export type FileUploadControllerProps = {
  accept?: string;
  children: (props: FileUploadControllerRenderProps) => React.ReactNode;
  maxFiles?: number;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
};

export const FileUploadController = ({ accept, children, maxFiles, multiple, onChange }: FileUploadControllerProps) => {
  const [files, setFiles] = React.useState<File[]>([]);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const toast = useToast();

  React.useEffect(() => {
    onChange?.(files);
  }, [files, onChange]);

  function validateMaxFiles(newFiles: File[]) {
    if (maxFiles && files.length + newFiles.length > maxFiles) {
      toast.error(`Exceeded maximum number of files. Max files allowed: ${maxFiles}`);
      return false;
    }
    return true;
  }

  function filterAcceptedFiles(files: FileList) {
    if (!accept) {
      return Array.from(files);
    }
    return Array.from(files).filter((f) => {
      const accepted = isFileAccepted(accept as string, f);

      if (!accepted) {
        toast.error(`File type not supported ${f.type}`);
      }

      return accepted;
    });
  }

  function openFileInput() {
    inputRef.current?.click();
  }

  function handleSelectedFiles(files: FileList) {
    const selectedFiles = filterAcceptedFiles(files);

    if (selectedFiles.length === 0) {
      return;
    }

    if (multiple && !validateMaxFiles(selectedFiles)) {
      clearFileInput();
      return;
    }

    if (multiple) {
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    } else {
      setFiles([selectedFiles[0]]);
    }
    clearFileInput();
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    handleSelectedFiles(e.target.files);
  }

  function handleDragOver(e: React.DragEvent<any>) {
    e.preventDefault();
  }

  function handleFileDrop(e: React.DragEvent<any>) {
    e.preventDefault();

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) {
      return;
    }

    handleSelectedFiles(e.dataTransfer.files);
  }

  function handleRemoveFile(index: number) {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }

  function clearFileInput() {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = '';
  }

  return (
    <>
      <input
        accept={accept}
        hidden
        multiple={multiple}
        onChange={handleFileInput}
        ref={inputRef}
        style={{ display: 'none' }}
        type="file"
      />
      {children({
        dragProps: {
          onDragOver: handleDragOver,
          onDrop: handleFileDrop,
        },
        files,
        handleRemoveFile,
        openFileInput,
      })}
    </>
  );
};
