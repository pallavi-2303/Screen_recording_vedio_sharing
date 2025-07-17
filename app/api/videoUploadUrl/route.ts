import { getVideoUploadUrl } from "@/lib/hooks/actions/video";

export async function GET() {
  try {
    const data = await getVideoUploadUrl(); 
    return Response.json(data);
  } catch (error) {
    console.error("Error generating video upload URL:", error);
    return new Response(JSON.stringify({ error: "Failed to generate credentials" }), {
      status: 500,
    });
  }
}
