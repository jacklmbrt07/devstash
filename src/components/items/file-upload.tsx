"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { FileIcon, ImageIcon, Upload, X } from "lucide-react";

import { RemoteImage } from "@/components/items/remote-image";
import { Button } from "@/components/ui/button";
import {
  acceptAttribute,
  formatFileSize,
  maxBytesForKind,
  validateUploadFile,
  type UploadKind,
} from "@/lib/items/file-upload";

export interface UploadedFile {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface FileUploadProps {
  kind: UploadKind;
  value: UploadedFile | null;
  onChange: (value: UploadedFile | null) => void;
  disabled?: boolean;
}

function uploadWithProgress(
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total === 0) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      const body = xhr.response as
        | UploadedFile
        | { error?: string }
        | null;
      if (xhr.status >= 200 && xhr.status < 300 && body && "fileUrl" in body) {
        resolve({
          fileUrl: body.fileUrl,
          fileName: body.fileName,
          fileSize: body.fileSize,
        });
        return;
      }
      const message =
        body && typeof body === "object" && "error" in body && body.error
          ? body.error
          : "Couldn't upload this file";
      reject(new Error(message));
    };

    xhr.onerror = () => reject(new Error("Couldn't upload this file"));
    xhr.send(formData);
  });
}

export function FileUpload({
  kind,
  value,
  onChange,
  disabled = false,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!value) {
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
      return;
    }
    if (kind === "image") {
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) return current;
        return value.fileUrl;
      });
    }
  }, [kind, value]);

  async function handleFile(file: File | undefined) {
    if (!file || disabled || progress !== null) return;
    setError(null);

    const validation = validateUploadFile({
      kind,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
    });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    if (kind === "image") {
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return localUrl;
      });
    }

    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("file", file);

    setProgress(0);
    try {
      const uploaded = await uploadWithProgress(formData, setProgress);
      onChange(uploaded);
      if (kind === "image") {
        setPreviewUrl((current) => {
          if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
          return uploaded.fileUrl;
        });
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Couldn't upload this file";
      setError(message);
      onChange(null);
      setPreviewUrl((current) => {
        if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
        return null;
      });
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  }

  const maxLabel =
    kind === "image"
      ? `Images up to ${formatFileSize(maxBytesForKind("image"))}`
      : `Files up to ${formatFileSize(maxBytesForKind("file"))}`;
  const uploading = progress !== null;

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          {kind === "image" && previewUrl ? (
            <div className="relative mb-3 h-48 w-full overflow-hidden rounded-md bg-black/20">
              <RemoteImage
                src={previewUrl}
                alt={value.fileName}
                sizes="28rem"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <FileIcon className="size-4 text-muted-foreground" aria-hidden />
              <span className="min-w-0 truncate font-medium">{value.fileName}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs text-muted-foreground">
              {value.fileName} · {formatFileSize(value.fileSize)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove file"
              disabled={disabled || uploading}
              onClick={() => {
                onChange(null);
                setError(null);
                setPreviewUrl((current) => {
                  if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
                  return null;
                });
              }}
            >
              <X />
            </Button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled && !uploading) setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={onDrop}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors",
            dragging
              ? "border-ring bg-muted/50"
              : "border-border bg-muted/20 hover:bg-muted/40",
            disabled || uploading ? "pointer-events-none opacity-50" : "",
          ].join(" ")}
        >
          {kind === "image" ? (
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
          ) : (
            <Upload className="size-6 text-muted-foreground" aria-hidden />
          )}
          <span className="text-sm font-medium">
            Drag and drop, or click to upload
          </span>
          <span className="text-xs text-muted-foreground">{maxLabel}</span>
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={acceptAttribute(kind)}
        disabled={disabled || uploading}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
        }}
      />

      {uploading ? (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full bg-foreground transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
