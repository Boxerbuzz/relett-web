import React, {
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, File, X, Image, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
  onFileRemoved?: (file: File) => void;
  showSelectedFiles?: boolean;
}

interface PreviewFile extends File {
  preview?: string;
  id: string;
}

export const FileDropzone = forwardRef<
  { resetFiles: () => void },
  FileDropzoneProps
>(
  (
    {
      onFilesSelected,
      accept = {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
      maxFiles = 10,
      maxSize = 10 * 1024 * 1024,
      disabled = false,
      className,
      multiple = true,
      onFileRemoved,
      showSelectedFiles = true,
    },
    ref
  ) => {
    const [selectedFiles, setSelectedFiles] = useState<PreviewFile[]>([]);

    const resetFiles = useCallback(() => {
      setSelectedFiles([]);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        resetFiles,
      }),
      [resetFiles]
    );

    const onDrop = useCallback(
      (acceptedFiles: File[]) => {
        const filesWithPreview = acceptedFiles.map((file) => {
          const fileWithId = Object.assign(file, {
            id: Math.random().toString(36).substring(2),
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
          });
          return fileWithId;
        });

        setSelectedFiles((prev) => [...prev, ...filesWithPreview]);
        onFilesSelected([...selectedFiles, ...acceptedFiles]);
      },
      [selectedFiles, onFilesSelected]
    );

    const removeFile = (fileId: string) => {
      setSelectedFiles((prev) => {
        const updated = prev.filter((file) => file.id !== fileId);
        onFilesSelected(updated);
        onFileRemoved?.(updated.find((file) => file.id === fileId) as File);
        return updated;
      });
    };

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
      useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize,
        disabled,
        multiple,
      });

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
      if (fileType.startsWith("image/")) return <Image className="w-4 h-4" />;
      if (fileType.startsWith("video/")) return <Video className="w-4 h-4" />;
      return <FileText className="w-4 h-4" />;
    };

    return (
      <div className={cn("space-y-4", className)}>
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <CardContent className="p-6">
            <div {...getRootProps()} className="text-center">
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="text-sm text-gray-500">
                    Max {maxFiles} files, up to {formatFileSize(maxSize)} each
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {fileRejections.length > 0 && (
          <div className="space-y-2">
            {fileRejections.map(({ file, errors }) => (
              <div
                key={file.name}
                className="text-sm text-red-600 bg-red-50 p-2 rounded"
              >
                {file.name}: {errors[0]?.message}
              </div>
            ))}
          </div>
        )}

        {showSelectedFiles && selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="grid gap-2">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Badge variant="outline">{file.type.split("/")[0]}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
