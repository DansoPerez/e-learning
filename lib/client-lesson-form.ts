import { uploadLessonFileToCloudinary } from "@/lib/client-cloudinary-upload";

export async function prepareLessonFormData(formData: FormData): Promise<void> {
  const videoFile = formData.get("video");
  if (videoFile instanceof File && videoFile.size > 0) {
    const { videoUrl } = await uploadLessonFileToCloudinary(videoFile, "video");
    if (videoUrl) formData.set("videoUrl", videoUrl);
    formData.delete("video");
  }

  const pdfFile = formData.get("pdf");
  if (pdfFile instanceof File && pdfFile.size > 0) {
    const { pdfStorageKey } = await uploadLessonFileToCloudinary(pdfFile, "pdf");
    if (pdfStorageKey) formData.set("uploadedPdfStorageKey", pdfStorageKey);
    formData.delete("pdf");
  }
}
