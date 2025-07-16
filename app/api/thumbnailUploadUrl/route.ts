import { getThumbnailUploadUrl } from "@/lib/hooks/actions/video";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return new Response(JSON.stringify({ error: "Missing videoId" }), {
      status: 400,
    });
  }

  try {
    const data = await getThumbnailUploadUrl(videoId);
    return Response.json(data);
  } catch (error) {
    console.error("Error generating thumbnail upload URL:", error);
    return new Response(JSON.stringify({ error: "Failed to generate credentials" }), {
      status: 500,
    });
  }
}
