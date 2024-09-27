import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import logger from "./logger"
import { type FileObject } from "../types/s3-file-type"
import { parse } from "file-type-mime"

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

const uploadFilesToS3 = async (files: FileObject[]) => {
  try {
    files.forEach(async (file) => {
      const result = parse(file.buffer)

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: file.location + "/" + file.filename,
        Body: file.buffer,
        ContentType: result?.mime,
      })

      await s3.send(command)
    })
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

export const uploadFile = async (file: FileObject) => {
  await uploadFilesToS3([file])
}

export const getFileUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME ?? "",
    Key: key,
  })
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
  return url
}
