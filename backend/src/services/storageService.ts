
import S3Client from "../config/minioManage";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.MINIO_BUCKET!;

// Generate a presigned URL for GET requests
export async function signGetObjectUrl(key?: string | null) {
    if (!key) return null;

    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
    });

    return await getSignedUrl(S3Client, command, {
        expiresIn: 24 * 60 * 60, // 1 day
    });
}

// Upload a file to S3
export async function uploadFileToS3(file: Express.Multer.File, key: string) {
    await S3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
    );
}

// Generate a presigned URL for a specific key (alias for consistency)
export async function generatePresignedUrlForKey(key: string) {
    if (!key) return null;
    return signGetObjectUrl(key);
}
