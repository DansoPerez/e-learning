"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Check, RotateCcw } from "lucide-react";

type Props = {
  onCaptured: (url: string) => void;
  required?: boolean;
};

export function SelfieCapture({ onCaptured, required = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setError(
        "Camera access denied or unavailable. Allow camera permission to complete instructor verification.",
      );
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!preview) startCamera();
    return () => stopCamera();
  }, [preview, startCamera, stopCamera]);

  async function captureAndUpload() {
    const video = videoRef.current;
    if (!video) return;

    setUploading(true);
    setError(null);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Could not capture image");
      setUploading(false);
      return;
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    stopCamera();

    try {
      const res = await fetch("/api/instructor/selfie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      setUploadedUrl(data.url);
      onCaptured(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload selfie");
      setPreview(null);
      startCamera();
    } finally {
      setUploading(false);
    }
  }

  function retake() {
    setPreview(null);
    setUploadedUrl(null);
    onCaptured("");
    startCamera();
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--background)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-[var(--foreground-secondary)]">
          Live selfie verification <span className="text-red-600">*</span>
        </p>
        {uploadedUrl ?
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Check className="h-4 w-4" />
            Captured
          </span>
        : null}
      </div>

      {error ?
        <p className="rounded-lg bg-[var(--danger-bg)] px-3 py-2 text-sm text-red-800">{error}</p>
      : null}

      <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl bg-slate-900">
        {preview ?
          <img
            src={uploadedUrl ?? preview}
            alt="Selfie"
            className="h-full w-full object-cover"
          />
        : <video
            ref={videoRef}
            className="h-full w-full object-cover [transform:scaleX(-1)]"
            playsInline
            muted
          />
        }
        {!cameraReady && !preview ?
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Starting camera...
          </div>
        : null}
      </div>

      <p className="text-xs text-[var(--foreground-muted)]">
        Position your face clearly in the frame. A live photo is required before your account can be
        created.
      </p>

      <div className="flex flex-wrap gap-2">
        {!uploadedUrl ?
          <Button
            type="button"
            onClick={captureAndUpload}
            disabled={!cameraReady || uploading}
            size="sm"
          >
            <Camera className="mr-1.5 h-4 w-4" />
            {uploading ? "Saving..." : "Capture selfie"}
          </Button>
        : <Button type="button" variant="outline" size="sm" onClick={retake}>
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Retake
          </Button>
        }
        {!preview && !cameraReady ?
          <Button type="button" variant="ghost" size="sm" onClick={startCamera}>
            Retry camera
          </Button>
        : null}
      </div>
    </div>
  );
}
