// /api/config/topics
// receive { userID: session?.userId, topics: fullTopics } request from frontend
// store topics in S3 under Key USERTOPIC_userID

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Resource } from "sst";

// Initialize the S3 client
const s3Client = new S3Client({ region: "us-east-1" });

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { userID, topics } = await request.json();

    if (!userID || !topics) {
      return NextResponse.json({ error: "Missing userID or topics" }, { status: 400 });
    }

    // Key for storing the topics in S3
    const s3Key = `USERTOPIC_${userID}`;

    // Define the PutObjectCommand for storing the topics
    const putCommand = new PutObjectCommand({
      Bucket: Resource.BytesizeBucket.name, // Replace with your actual S3 bucket name
      Key: s3Key,
      Body: JSON.stringify(topics),
      ContentType: "application/json",
    });

    // Upload the topics to S3
    await s3Client.send(putCommand);

    // Return a success response
    return NextResponse.json({ message: "Topics saved successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error saving topics to S3:", error);
    return NextResponse.json({ error: "Failed to save topics" }, { status: 500 });
  }
}
