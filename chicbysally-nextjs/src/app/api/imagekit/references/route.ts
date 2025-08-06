import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 5);
    const skip = (page - 1) * limit;

    const apiKey = process.env.IMAGEKIT_API_KEY;
    if (!apiKey) {
      // Server-side log for diagnosis; response is 500 for the client.
      console.error("ImageKit API key not found in environment variables");
      return NextResponse.json(
        { error: "ImageKit API key missing on server" },
        { status: 500 }
      );
    }

    const apiUrl = `https://api.imagekit.io/v1/files?path:Reference&skip=${skip}&limit=${limit}`;
    const authHeader = "Basic " + Buffer.from(`${apiKey}:`).toString("base64");

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      // ensure always fresh
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("ImageKit list error:", response.status, text);
      return NextResponse.json(
        { error: `ImageKit request failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    // Normalize to our ReferenceImage[]
    const images = (Array.isArray(data) ? data : []).map(
      (item: { fileId: string; url: string; name?: string }) => ({
        id: item.fileId,
        url: item.url,
        title: item.name || "Reference Image",
      })
    );

    return NextResponse.json(images);
  } catch (err) {
    console.error("Server error fetching ImageKit references:", err);
    return NextResponse.json(
      { error: "Server error fetching ImageKit references" },
      { status: 500 }
    );
  }
}
