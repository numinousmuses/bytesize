// /api/config/topics/userID
// get userID by getting it off the end of the URL
// get topics from S3 using the USERTOPIC_userID key

import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Resource } from "sst";
import * as stream from "stream";

// Initialize the S3 client
const s3Client = new S3Client({ region: "us-east-1" });

// Helper function to convert S3 stream to string
const streamToString = (stream: stream.Readable): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

export async function GET(request: NextRequest) {
  try {
    // Extract the full URL
    const url = new URL(request.url);

    // Extract the path segments
    const pathSegments = url.pathname.split("/");

    // Assuming the userID is the last segment of the URL
    const userID = pathSegments[pathSegments.length - 1];

    if (!userID) {
      return NextResponse.json({ error: "Missing userID in URL" }, { status: 400 });
    }

    // Key for retrieving the topics from S3
    const s3Key = `USERTOPIC_${userID}`;

    // Define the GetObjectCommand to fetch the topics
    const getCommand = new GetObjectCommand({
      Bucket: Resource.BytesizeBucket.name, // Replace with your actual S3 bucket name
      Key: s3Key,
    });

    // Fetch the object from S3
    const response = await s3Client.send(getCommand);

    // Check if the body is a readable stream
    if (response.Body instanceof stream.Readable) {
      const data = await streamToString(response.Body);
      const topics = JSON.parse(data);

      // Return the topics as JSON
      return NextResponse.json(topics, { status: 200 });
    } else {
      throw new Error("Unexpected response body type from S3");
    }

  } catch (error) {
    console.error("Error retrieving topics from S3:", error);
    return NextResponse.json({ error: "Failed to retrieve topics" }, { status: 500 });
  }
}
