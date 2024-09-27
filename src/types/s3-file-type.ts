export interface S3File extends Express.Multer.File {
  key?: string
  location?: string
}

export interface FileObject {
  filename: string
  buffer: Buffer
  location: string
}
