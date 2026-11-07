import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function getConfig() {
  return {
    accountId: requiredEnv("R2_ACCOUNT_ID"),
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    bucket: requiredEnv("R2_BUCKET_NAME"),
    publicUrl: requiredEnv("R2_PUBLIC_URL").replace(/\/$/, ""),
  };
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  const { accountId, accessKeyId, secretAccessKey } = getConfig();
  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  return client;
}

export function publicUrlForKey(key: string): string {
  return `${getConfig().publicUrl}/${key}`;
}

export function objectKeyFromPublicUrl(fileUrl: string): string | null {
  const { publicUrl } = getConfig();
  const prefix = `${publicUrl}/`;
  if (!fileUrl.startsWith(prefix)) return null;
  const key = fileUrl.slice(prefix.length);
  return key.length > 0 ? key : null;
}

export async function uploadObject(input: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<void> {
  const { bucket } = getConfig();
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  const { bucket } = getConfig();
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export async function getObject(key: string): Promise<{
  body: ReadableStream | null;
  contentType: string | undefined;
  contentLength: number | undefined;
}> {
  const { bucket } = getConfig();
  const response = await getClient().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  const body = response.Body
    ? (response.Body.transformToWebStream() as ReadableStream)
    : null;

  return {
    body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
  };
}

export async function deleteStoredFile(fileUrl: string | null | undefined) {
  if (!fileUrl) return;
  try {
    const key = objectKeyFromPublicUrl(fileUrl);
    if (!key) return;
    await deleteObject(key);
  } catch (error) {
    console.error("R2 delete failed:", error);
  }
}
