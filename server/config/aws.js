import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export const s3Config = {
    bucketName: process.env.AWS_BUCKET_NAME,
    region: process.env.AWS_REGION
};

export const deleteS3Object = async (imageUrl) => {
    try {
        // Extract the key from the URL
        // URL format: https://bucket-name.s3.region.amazonaws.com/path/to/image.jpg
        const key = imageUrl.split('.com/')[1];
        
        const command = new DeleteObjectCommand({
            Bucket: s3Config.bucketName,
            Key: key
        });

        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error('Error deleting from S3:', error);
        return false;
    }
};

export default s3Client; 