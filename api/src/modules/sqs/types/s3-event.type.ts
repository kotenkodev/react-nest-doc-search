export interface S3EventRecord {
  eventVersion?: string;
  eventSource?: string;
  awsRegion?: string;
  eventTime?: string;
  eventName: string;
  userIdentity?: {
    principalId: string;
  };
  requestParameters?: {
    sourceIPAddress: string;
  };
  responseElements?: {
    'x-amz-request-id': string;
    'x-amz-id-2': string;
  };
  s3: {
    s3SchemaVersion?: string;
    configurationId?: string;
    bucket: {
      name: string;
      arn?: string;
      ownerIdentity?: {
        principalId: string;
      };
    };
    object: {
      key: string;
      size?: number;
      eTag?: string;
      sequencer?: string;
    };
  };
}

export interface S3SqsEventPayload {
  Records?: S3EventRecord[];
}
