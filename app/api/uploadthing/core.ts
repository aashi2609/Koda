import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// File Router configuration
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  resourceUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    text: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    // Set permissions and file types for this FileRoute
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata);
      console.log("file url", file.url);
      
      // !!! return data to the client-side onUploadComplete callback
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
