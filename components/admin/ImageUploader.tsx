"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 6 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      // Requesting a fresh signature per file (rather than reusing one) avoids
      // timestamp/signature collisions when uploading several files quickly.
      for (const file of filesToUpload) {
        const sigRes = await fetch("/api/upload", { method: "POST" });
        if (!sigRes.ok) {
          const data = await sigRes.json().catch(() => ({}));
          throw new Error(data.error || "Failed to get upload signature");
        }
        const { signature, timestamp, folder, apiKey, cloudName } = await sigRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );
        if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
        const data = await uploadRes.json();
        uploadedUrls.push(data.secure_url);
      }

      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {images.map((url) => (
          <div
            key={url}
            className="relative group aspect-square rounded-md overflow-hidden border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:border-gray-500 hover:text-gray-600">
            <Upload size={20} />
            <span className="text-xs mt-1 text-center px-1">
              {uploading ? "Uploading..." : "Add image"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
