"use client";

import { useRef, useState } from "react";

export function ImageUploadField() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function syncInputFiles(nextFiles: File[]) {
    if (!inputRef.current) {
      return;
    }

    const dataTransfer = new DataTransfer();

    nextFiles.forEach((file) => {
      dataTransfer.items.add(file);
    });

    inputRef.current.files = dataTransfer.files;
  }

  function addFiles(selectedFiles: File[]) {
    const nextFiles = [...files];

    selectedFiles.forEach((selectedFile) => {
      const alreadyAdded = nextFiles.some((file) => {
        return (
          file.name === selectedFile.name &&
          file.size === selectedFile.size &&
          file.lastModified === selectedFile.lastModified
        );
      });

      if (!alreadyAdded) {
        nextFiles.push(selectedFile);
      }
    });

    setFiles(nextFiles);
    syncInputFiles(nextFiles);
  }

  function removeFile(fileToRemove: File) {
    const nextFiles = files.filter((file) => file !== fileToRemove);

    setFiles(nextFiles);
    syncInputFiles(nextFiles);
  }

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm font-medium text-gray-700">
      Imagenes
      <input
        ref={inputRef}
        id="product-images"
        name="images"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-primary/30 bg-secondary/60 text-4xl font-light text-primary transition hover:border-primary hover:bg-accent/30"
        aria-label="Elegir imagenes del producto"
      >
        +
      </button>

      {files.length > 0 ? (
        <ul className="grid gap-2 text-xs font-normal text-gray-500">
          {files.map((file) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}`}
              className="flex items-center justify-between gap-3 rounded-md bg-secondary px-3 py-2"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="shrink-0 rounded-md px-2 py-1 font-semibold text-primary transition hover:bg-white"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs font-normal text-gray-500">
          Podes seleccionar una o varias imagenes desde tu computadora.
        </p>
      )}
    </div>
  );
}
