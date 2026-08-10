"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Square preview by default; pass "banner" for a wide 16:6 preview. */
  aspect?: "square" | "banner";
}

/**
 * Uploads exactly one image and returns its Cloudinary URL. Shares the same
 * signed-upload flow as the multi-image ImageUploader (request a signature from
 * /api/upload, then upload straight to Cloudinary — file bytes never touch our
 * server). Used across the CMS for logo, favicon, hero background, and banners.
 */
export function SingleImageUpload({
  value,
  onChange,
  label,
  aspect = "square",
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    try {
      const sigRes = await fetch("/api/upload", { method: "POST" });
      if (!sigRes.ok) {
        const data = await sigRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get upload signature");
      }
      const { signature, timestamp, folder, apiKey, cloudName } = await sigRes.json();

      const formData = new FormData();
      formData.append("file", files[0]);
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
      onChange(data.secure_url);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const previewClass = aspect === "banner" ? "w-full aspect-[16/6]" : "w-28 aspect-square";

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      {value ? (
        <div className={`relative group rounded-md overflow-hidden border ${previewClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label
          className={`${previewClass} rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:border-gray-500 hover:text-gray-600`}
        >
          <Upload size={18} />
          <span className="text-xs mt-1">{uploading ? "Uploading..." : "Upload"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files)}
          />
        </label>
      )}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
