import { cn } from '@/lib/utils';
import { isFileAccepted } from '@/utils/files';
import { formatBytes } from '@/utils/format';
import { X } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

export type FileDropAreaProps = {
  accept?: string;
  files: File[];
  maxFiles?: number;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  showFileSize?: boolean;
  showImagePreview?: boolean;
};

export const FileDropArea = ({
  accept,
  files,
  maxFiles,
  multiple,
  onChange,
  showFileSize = true,
  showImagePreview,
  ...props
}: FileDropAreaProps) => {
  const [dragActive, setDragActive] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const objectUrls = React.useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  function openFileInput() {
    inputRef.current?.click();
  }

  function filterAcceptedFiles(fileList: FileList) {
    if (!accept) {
      return Array.from(fileList);
    }
    return Array.from(fileList).filter((f) => {
      const accepted = isFileAccepted(accept, f);

      if (!accepted) {
        toast.error(`File type not supported ${f.type}`);
      }

      return accepted;
    });
  }

  function validateMaxFiles(newFiles: File[]) {
    if (maxFiles && files.length + newFiles.length > maxFiles) {
      toast.error(`Exceeded maximum number of files. Max files allowed: ${maxFiles}`);
      return false;
    }
    return true;
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    handleSelectedFiles(e.target.files);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleFileDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectedFiles(e.dataTransfer.files);
    }
  }

  function handleSelectedFiles(fileList: FileList) {
    const acceptedFiles = filterAcceptedFiles(fileList);

    if (acceptedFiles.length === 0) {
      return;
    }

    if (multiple && !validateMaxFiles(acceptedFiles)) {
      clearFileInput();
      return;
    }

    if (multiple) {
      onChange?.([...files, ...acceptedFiles]);
    } else {
      onChange?.([acceptedFiles[0]]);
    }

    clearFileInput();
  }

  function handleRemoveFile(index: number) {
    onChange?.(files.filter((_, i) => i !== index));
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
        className="hidden"
        hidden
        multiple={multiple}
        onChange={handleFileInput}
        ref={inputRef}
        type="file"
        {...props}
      />
      <div
        className={cn('flex flex-col justify-center gap-4 rounded-md border border-dashed py-4', {
          'ring-ring border-solid ring-3': dragActive,
        })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="font-medium">Drop files here</div>
          <div className="text-sm">or</div>
          <Button onClick={openFileInput} size="sm" variant="outline">
            Browse Files
          </Button>
        </div>
      </div>
      {files.length > 0 && (
        <ul className="mt-2 flex max-h-48 w-full flex-col overflow-auto">
          {files.map((file, index) => (
            <li className="flex items-center gap-4 px-2 py-1 not-last:border-b" key={file.name}>
              {showImagePreview && (
                <img
                  className="bg-background h-8 w-8 rounded-md object-contain"
                  src={objectUrls[index]}
                  alt={file.name}
                />
              )}
              <div className="flex-1 text-xs">{file.name}</div>
              {showFileSize && <div className="text-xs text-nowrap">{formatBytes(file.size, 1)}</div>}
              <Button onClick={() => handleRemoveFile(index)} size="icon" variant="ghost">
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
