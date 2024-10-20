/* eslint-disable */
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "bytesize",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {

    const bucket = new sst.aws.Bucket("BytesizeBucket");

    const genesisssearchapikey = new sst.Secret("BytesizeAPIKey")

    const SessionsTable = new sst.aws.Dynamo("BytesizeSessionTable", {
      fields: {
        sessionId: "string",
        userId: "string",
      },
      primaryIndex: { hashKey: "sessionId", rangeKey: "userId" },

    })

    const finaluserstable = new sst.aws.Dynamo("BytesizeUsersTable", {
      fields: {
        userID: "string",
        email: "string",
      },
      primaryIndex: { hashKey: "userID" },
      globalIndexes: {
        emailIndex: { hashKey: "email" },
      }
    });


    new sst.aws.Nextjs("Bytesize", {
      link: [
        bucket,
        genesisssearchapikey,
        SessionsTable,
        finaluserstable,
      ],
      domain: "bytesize.world",
    });
  },
});
