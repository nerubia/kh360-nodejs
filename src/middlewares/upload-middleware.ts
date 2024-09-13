import multer from "multer"
import multerS3 from "multer-s3"
import { S3Client } from "@aws-sdk/client-s3"

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
})

export const uploadMiddleware = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME ?? "",
    metadata: function (_, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (_, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname)
    },
  }),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024,
  },
})
