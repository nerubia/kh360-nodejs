import { type Prisma } from "@prisma/client"
import * as PaymentRepository from "../../repositories/khbooks/payment-repository"
import CustomError from "../../utils/custom-error"
import { type PaymentDetail } from "../../types/payment-detail-type"
import * as PaymentDetailRepository from "../../repositories/khbooks/payment-detail-repository"

export const updateByPaymentId = async (id: number, paymentDetails: PaymentDetail[]) => {
  const payment = await PaymentRepository.getById(id)
  if (payment === null) {
    throw new CustomError("Payment record not found", 400)
  }

  const currentDate = new Date()

  const newPaymentDetails: Prisma.payment_detailsCreateManyInput[] = []
  const newIds: number[] = []

  for (const paymentDetail of paymentDetails) {
    if (paymentDetail.id === undefined) {
      newPaymentDetails.push({
        payment_id: payment.id,
        invoice_id: paymentDetail.invoice_id,
        payment_amount: paymentDetail.payment_amount,
        created_at: currentDate,
        updated_at: currentDate,
      })
    } else {
      await PaymentDetailRepository.updateById(paymentDetail.id, {
        payment_id: payment.id,
        invoice_id: paymentDetail.invoice_id,
        payment_amount: paymentDetail.payment_amount,
        created_at: currentDate,
        updated_at: currentDate,
      })

      newIds.push(paymentDetail.id)
    }
  }

  await PaymentDetailRepository.createMany(newPaymentDetails)

  const existingIds = payment.payment_details.map((paymentDetail) => paymentDetail.id)
  const toDelete = existingIds.filter((itemId: number) => !newIds.includes(itemId))

  await PaymentDetailRepository.deleteMany(toDelete)
}
