import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("recording") as File;
    let sessionId = formData.get("sessionId") as string;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: "Missing recording file or sessionId" },
        { status: 400 }
      );
    }

    // Sanitize sessionId to prevent directory traversal
    sessionId = path.basename(sessionId).replace(/[^a-zA-Z0-9_-]/g, "");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Invalid sessionId" },
        { status: 400 }
      );
    }

    // Create recordings directory if it doesn't exist
    const recordingsDir = path.join(process.cwd(), "public", "recordings");
    await mkdir(recordingsDir, { recursive: true });

    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${sessionId}.webm`;
    const filePath = path.join(recordingsDir, fileName);
    await writeFile(filePath, buffer);

    const recordingUrl = `/recordings/${fileName}`;

    return NextResponse.json({ success: true, recordingUrl });
  } catch (error) {
    console.error("Error uploading recording:", error);
    return NextResponse.json(
      { error: "Failed to upload recording" },
      { status: 500 }
    );
  }
}
