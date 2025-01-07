import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Resource } from "sst"; // Uncomment if using SST

// Initialize the S3 client
const s3Client = new S3Client({ region: "us-east-1" });

// Define the structure of the request
interface StoreByteRequest {
  userID: string;
  bytes: Byte[];
  nextByte: boolean;
}

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

interface StoredBytes {
  lastupdated: string; // ISO timestamp
  bytes: Byte[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get userID, bytes, and nextByte
    const { userID, bytes, nextByte }: StoreByteRequest = await request.json();

    if (!userID || !bytes) {
      return NextResponse.json({ error: "Missing userID or bytes" }, { status: 400 });
    }

    // Create the object to store, including the current timestamp
    const storedData: StoredBytes = {
      lastupdated: new Date().toISOString(),
      bytes: bytes,
    };

    // Determine the S3 key based on the nextByte flag
    const s3Key = nextByte ? `USERNEXTBYTES_${userID}` : `USERBYTES_${userID}`;

    // Define the PutObjectCommand for storing the bytes in S3
    const putCommand = new PutObjectCommand({
      Bucket: Resource.BytesizeBucket.name, // Replace with your actual S3 bucket name or use environment variable
      Key: s3Key,
      Body: JSON.stringify(storedData), // Store the entire object
      ContentType: "application/json",
    });

    // Upload the bytes to S3
    await s3Client.send(putCommand);

    // Return a success response
    return NextResponse.json({ message: "Bytes stored successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error storing bytes in S3:", error);
    return NextResponse.json({ error: "Failed to store bytes" }, { status: 500 });
  }
}
