import { requireUser } from "@/app/utils/requireuser";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      try {
        const session = await requireUser();
        return { userId: session.id };
      } catch {
        throw new UploadThingError("Middleware execution failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),

  resumeUploader: f({ "application/pdf": { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      try {
        const session = await requireUser();
        return { userId: session.id };
      } catch {
        throw new UploadThingError("Middleware execution failed");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
