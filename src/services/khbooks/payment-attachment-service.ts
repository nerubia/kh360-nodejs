import * as PaymentAttachmentRepository from "../../repositories/khbooks/payment-attachment-repository"
import { deleteFiles } from "../../utils/s3"

export const deleteMany = async (ids: number[]) => {
  const attachments = await PaymentAttachmentRepository.getByFilters({
    id: {
      in: ids,
    },
  })

  const fileNames = []
  for (const attachment of attachments) {
    if (attachment.filename !== null) {
      fileNames.push(attachment.filename)
    }
  }

  await deleteFiles(fileNames)

  await PaymentAttachmentRepository.deleteMany(ids)
}
