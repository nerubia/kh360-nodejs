import prisma from "../../utils/prisma"
import { type Prisma } from "@prisma/client"

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.paymentsWhereInput
) => {
  return await prisma.payments.findMany({
    skip,
    take,
    where,
    include: {
      clients: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      {
        payment_date: "desc",
      },
      {
        payment_reference_no: "asc",
      },
      {
        clients: {
          name: "asc",
        },
      },
    ],
  })
}

export const countAllByFilters = async (where: Prisma.paymentsWhereInput) => {
  const count = await prisma.payments.count({
    where,
  })
  return count
}

export const create = async (data: Prisma.paymentsUncheckedCreateInput) => {
  return await prisma.payments.create({
    data,
  })
}

export const generatePaymentNumberById = async (id: number) => {
  return await prisma.$transaction(async (tx) => {
    const payments = await tx.payments.findMany({
      where: {
        AND: [
          {
            payment_no: {
              not: undefined,
            },
          },
          {
            payment_no: {
              not: null,
            },
          },
          {
            payment_no: {
              not: "",
            },
          },
        ],
      },
      orderBy: {
        payment_no: "desc",
      },
      take: 1,
    })

    let paymentNo = 0

    if (payments.length === 1) {
      paymentNo = Number(payments[0].payment_no) + 1
    }

    const formattedPaymentNo = paymentNo.toString().padStart(4, "0")

    await tx.payments.update({
      where: {
        id,
      },
      data: {
        payment_no: formattedPaymentNo,
      },
    })

    return formattedPaymentNo
  })
}

export const getById = async (id: number) => {
  return await prisma.payments.findFirst({
    where: {
      id,
    },
    include: {
      clients: {
        select: {
          id: true,
          name: true,
          display_name: true,
          contact_no: true,
          status: true,
        },
      },
      companies: {
        select: {
          id: true,
          name: true,
          city: true,
          state: true,
          country: true,
          zip: true,
          street: true,
          public_url: true,
          shorthand: true,
        },
      },
      currencies: {
        select: {
          id: true,
          name: true,
          code: true,
          prefix: true,
        },
      },
      payment_details: {
        select: {
          id: true,
          invoice_id: true,
          payment_amount: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
  })
}
