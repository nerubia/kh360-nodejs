import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3"
import logger from "./logger"

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
})

const deleteFilesFromS3 = async (fileNames: string[]) => {
  try {
    if (fileNames.length > 0) {
      const objects = fileNames.map((fileName) => ({ Key: fileName }))
      const command = new DeleteObjectsCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Delete: {
          Objects: objects,
          Quiet: true,
        },
      })
      await s3.send(command)
    }
  } catch (error) {
    logger.error(error)
  }
}

export const deleteFile = async (fileName: string) => {
  await deleteFilesFromS3([fileName])
}

export const deleteFiles = async (fileNames: string[]) => {
  await deleteFilesFromS3(fileNames)
}
