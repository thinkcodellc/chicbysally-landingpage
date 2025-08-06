import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.IMAGEKIT_API_KEY;
    if (!apiKey) {
      console.error("ImageKit API key not found in environment variables");
      return NextResponse.json(
        { error: "ImageKit API key missing on server" },
        { status: 500 }
      );
    }

    const apiUrl = `https://api.imagekit.io/v1/files?path:Reference`;
    const authHeader = "Basic " + Buffer.from(`${apiKey}:`).toString("base64");

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("ImageKit count error:", response.status, text);
      return NextResponse.json(
        { error: `ImageKit request failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const count = Array.isArray(data) ? data.length : 0;

    return NextResponse.json(count);
  } catch (err) {
    console.error("Server error fetching ImageKit references count:", err);
    return NextResponse.json(
      { error: "Server error fetching ImageKit references count" },
      { status: 500 }
    );
  }
}
