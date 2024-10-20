// // app/api/auth/signup/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// import { hashEmail, hashPassword } from '@/lib/utils';
// import { sendVerificationEmail } from '@/lib/email';
// import { v4 as uuidv4 } from 'uuid';
// import { PutItemCommand } from '@aws-sdk/client-dynamodb';
// import { Resource } from 'sst';

// export async function POST(req: NextRequest) {
//   const { email, password, username } = await req.json();

//   const userId = hashEmail(email);
//   const passwordHash = hashPassword(password);
//   const verificationToken = uuidv4();

//   console.log('userId', userId);
//   console.log('passwordHash', passwordHash);
//   console.log('username', username);

//   const client = DynamoDBDocumentClient.from(new DynamoDBClient({region: 'us-east-1'}));

//   try {
//     console.log('the code got to this point');

//     const usersk = uuidv4().replace(/-/g, '');
//     // Use PutItemCommand for directly interacting with DynamoDB
//     await client.send(new PutItemCommand({
//       TableName: Resource.BytesizeUsersTable.name,
//       Item: {
//         userID: { S: userId },
//         email: { S: email },
//         username: { S: username },
//         sk: { S: usersk },
//         passwordHash: { S: passwordHash },
//         isVerified: { BOOL: false },
//         verificationToken: { S: verificationToken },
//       },
//     }));

//     console.log('the code got here');

//     // Send verification email
//     await sendVerificationEmail(email, userId, verificationToken);

//     return NextResponse.json({ message: 'User created. Please verify your email.' }, { status: 201 });
//   } catch (error) {
//     console.log('There was an error creating USER', error);
//     // console.log('There was an error creating USER', error.message!);
//     return NextResponse.json({ message: 'Error creating user', error }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { hashEmail, hashPassword } from '@/lib/utils';
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { Resource } from 'sst';

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json();

  const userId = hashEmail(email);
  const passwordHash = hashPassword(password);
  const verificationToken = uuidv4();

  console.log('userId', userId);
  console.log('passwordHash', passwordHash);
  console.log('username', username);

  const client = DynamoDBDocumentClient.from(new DynamoDBClient({region: 'us-east-1'}));

  try {
    // Check if the email already exists

    let queryResult
    
    try {queryResult = await client.send(new QueryCommand({
      TableName: Resource.BytesizeUsersTable.name,
      IndexName: 'emailIndex', // Assuming there is an index on the 'email' attribute
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email 
      },
      Limit: 1
    }));
  
    console.log("\n\n\n\n\n")

      console.log("QUERYRESULT")
      console.log(queryResult);
      console.log("\n\n\n\n\n")
  } catch (error) {
      console.log('There was an error', error);
      
    }

    if (queryResult!.Count && queryResult!.Count > 0) {
      console.log('Email already exists');
      return NextResponse.json({ message: 'Email already in use.' }, { status: 409 });
    }

    const usersk = uuidv4().replace(/-/g, '');
    // Use PutItemCommand for directly interacting with DynamoDB
    await client.send(new PutItemCommand({
      TableName: Resource.BytesizeUsersTable.name,
      Item: {
        userID: { S: userId },
        email: { S: email },
        username: { S: username },
        sk: { S: usersk },
        passwordHash: { S: passwordHash },
        isVerified: { BOOL: false },
        verificationToken: { S: verificationToken },
      },
    }));

    // Send verification email
    await sendVerificationEmail(email, userId, verificationToken);

    return NextResponse.json({ message: 'User created. Please verify your email.' }, { status: 201 });
  } catch (error) {
    console.log('There was an error', error);
    return NextResponse.json({ message: 'Error creating user', error }, { status: 500 });
  }
}
