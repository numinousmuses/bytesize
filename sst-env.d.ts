/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
import "sst"
export {}
declare module "sst" {
  export interface Resource {
    "Bytesize": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
    "BytesizeAPIKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "BytesizeBucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "BytesizeSessionTable": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
    "BytesizeUsersTable": {
      "name": string
      "type": "sst.aws.Dynamo"
    }
  }
}
