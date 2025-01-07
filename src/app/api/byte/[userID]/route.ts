/* eslint-disable */
// File: /api/byte/[userId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// Replace this with your actual import or define the bucket name directly
import { Resource } from "sst"; 

// Initialize the S3 client
const s3Client = new S3Client({ region: "us-east-1" });

// Define the structure of the Byte
interface Byte {
  title: string;
  description: string;
  tag: string;
  longdescription: string;
  mainlink: string;
  otherlinks?: string[];
  backgroundColor?: string;
  headerPatternColors?: { [key: string]: string };
  patternClass?: string;
}

// Structure of the data stored in S3
interface StoredBytes {
  lastupdated: string; // ISO timestamp
  bytes: Byte[];
}

// Structure of the API response
interface ApiResponse {
  shouldUpdate: boolean;
  bytesData: Byte[];
}

// Helper function to convert S3 stream to string
const streamToString = (stream: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on("data", (chunk: any) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });

export async function GET(request: NextRequest) {
  // Extract the full URL
  const url = new URL(request.url);

  // Extract the path segments
  const pathSegments = url.pathname.split("/");

  // Assuming the userID is the last segment of the URL
  const userId = pathSegments[pathSegments.length - 1];

  if (!userId) {
    return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
  }

  const BUCKET_NAME = Resource.BytesizeBucket.name; // Replace with your actual S3 bucket name or use environment variable

  const USERBYTES_KEY = `USERBYTES_${userId}`;
  const USERNEXTBYTES_KEY = `USERNEXTBYTES_${userId}`;

  try {
    // Function to fetch StoredBytes from S3
    const fetchStoredBytes = async (key: string): Promise<StoredBytes | null> => {
      try {
        const getCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });

        const response = await s3Client.send(getCommand);
        const body = await streamToString(response.Body);
        return JSON.parse(body) as StoredBytes;
      } catch (error: any) {
        if (error.name === "NoSuchKey") {
          // The object does not exist
          return null;
        }
        throw error;
      }
    };

    // Fetch current USERBYTES
    const currentStoredBytes = await fetchStoredBytes(USERBYTES_KEY);

    if (!currentStoredBytes) {
      // If USERBYTES does not exist, attempt to fetch USERNEXTBYTES and set it as current
      const nextStoredBytes = await fetchStoredBytes(USERNEXTBYTES_KEY);

      if (!nextStoredBytes) {
        // Neither USERBYTES nor USERNEXTBYTES exist
        return NextResponse.json(
          { error: "No bytes data found for the user." },
          { status: 404 }
        );
      }

      // Update USERBYTES with USERNEXTBYTES data
      const updatedStoredBytes: StoredBytes = {
        lastupdated: new Date().toISOString(),
        bytes: nextStoredBytes.bytes,
      };

      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: USERBYTES_KEY,
        Body: JSON.stringify(updatedStoredBytes),
        ContentType: "application/json",
      });

      await s3Client.send(putCommand);

      return NextResponse.json({
        shouldUpdate: true,
        bytesData: updatedStoredBytes.bytes,
      } as ApiResponse, { status: 200 });
    }

    // Parse the lastupdated timestamp
    const lastUpdated = new Date(currentStoredBytes.lastupdated);
    const currentTime = new Date();
    const oneHourInMs = 60 * 60 * 1000;

    if (currentTime.getTime() - lastUpdated.getTime() > oneHourInMs) {
      // Time to update bytesData from USERNEXTBYTES
      const nextStoredBytes = await fetchStoredBytes(USERNEXTBYTES_KEY);

      if (nextStoredBytes) {
        // USERNEXTBYTES exists, update USERBYTES with it
        const updatedStoredBytes: StoredBytes = {
          lastupdated: currentTime.toISOString(),
          bytes: nextStoredBytes.bytes,
        };

        const putCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: USERBYTES_KEY,
          Body: JSON.stringify(updatedStoredBytes),
          ContentType: "application/json",
        });

        await s3Client.send(putCommand);

        return NextResponse.json({
          shouldUpdate: true,
          bytesData: updatedStoredBytes.bytes,
        } as ApiResponse, { status: 200 });
      } else {
        // USERNEXTBYTES does not exist, return current bytes with shouldUpdate=true
        return NextResponse.json({
          shouldUpdate: true,
          bytesData: currentStoredBytes.bytes,
        } as ApiResponse, { status: 200 });
      }
    } else {
      // No update needed
      return NextResponse.json({
        shouldUpdate: false,
        bytesData: currentStoredBytes.bytes,
      } as ApiResponse, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching bytes from S3:", error);
    return NextResponse.json(
      { error: "Failed to fetch bytes data." },
      { status: 500 }
    );
  }
}
