import { S3Client, PutObjectCommand,PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Handler {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY),
        secretAccessKey: String(process.env.AWS_SECRET_KEY)
      },
      region: String(process.env.AWS_REGION),
    });
  }
   async getPreSignedURL(key: string, contentType: string): Promise<string> {
    const params = {
      Bucket: String(process.env.AWS_S3_BUCKET),
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    };
    const command = new PutObjectCommand(params as PutObjectCommandInput);
    const url = await this.getSignedUrl(command);
    return url;
  }
  private async getSignedUrl(command: PutObjectCommand): Promise<string> {
    return await getSignedUrl(this.s3Client, command);
  }
}

export default S3Handler;