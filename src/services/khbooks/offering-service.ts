import { type Prisma } from "@prisma/client"
import * as OfferingRepository from "../../repositories/khbooks/offering-repository"
import * as OfferingCategoryRepository from "../../repositories/khbooks/offering-category-repository"
import * as ClientRepository from "../../repositories/client-repository"
import * as CurrencyRepository from "../../repositories/khbooks/currency-repository"
import * as InvoiceRepository from "../../repositories/khbooks/invoice-repository"
import CustomError from "../../utils/custom-error"
import { type OfferingFilters, type Offering } from "../../types/offering-type"
import { removeWhitespace } from "../../utils/format-string"
import { InvoiceStatus } from "../../types/invoice-type"

export const getAllByFilters = async ({
  name,
  category_id,
  client_id,
  global,
  is_active,
  page,
  orderBy,
}: OfferingFilters) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.offeringsWhereInput = {}

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  if (!isNaN(category_id)) {
    Object.assign(where, {
      offering_category_id: category_id,
    })
  }

  if (!isNaN(client_id) && !global) {
    Object.assign(where, {
      client_id,
    })
  }

  if (isNaN(client_id) && global) {
    Object.assign(where, {
      client_id: null,
    })
  }

  if (!isNaN(client_id) && global) {
    Object.assign(where, {
      OR: [
        {
          client_id,
        },
        {
          client_id: null,
        },
      ],
    })
  }

  if (is_active !== undefined) {
    Object.assign(where, {
      is_active: Boolean(parseInt(is_active)),
    })
  }

  const finalOrderBy = orderBy ?? []

  const offerings = await OfferingRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where,
    [
      ...finalOrderBy,
      {
        created_at: "desc",
      },
    ]
  )

  const totalItems = await OfferingRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: offerings,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}

export const create = async (data: Offering) => {
  const offering = await OfferingRepository.getByName(removeWhitespace(data.name))
  if (offering !== null) {
    throw new CustomError("Service name should be unique", 400)
  }

  const client = await ClientRepository.getById(data.client_id)

  const offeringCategory = await OfferingCategoryRepository.getById(data.offering_category_id)
  if (offeringCategory === null) {
    throw new CustomError("Category not found", 400)
  }

  const currency = await CurrencyRepository.getById(data.currency_id)
  if (currency === null) {
    throw new CustomError("Currency not found", 400)
  }

  const currentDate = new Date()

  return await OfferingRepository.create({
    name: data.name,
    client_id: client?.id ?? null,
    offering_category_id: offeringCategory.id,
    offering_type: "service",
    currency_id: currency.id,
    price: data.price,
    description: data.description,
    is_active: data.is_active,
    created_at: currentDate,
    updated_at: currentDate,
  })
}

export const getById = async (id: number) => {
  return await OfferingRepository.getById(id)
}

export const updateById = async (id: number, data: Offering) => {
  const offering = await OfferingRepository.getById(id)

  if (offering === null) {
    throw new CustomError("Offering not found", 400)
  }

  const existingOffering = await OfferingRepository.getByName(removeWhitespace(data.name))
  if (existingOffering !== null && offering.id !== existingOffering.id) {
    throw new CustomError("Service name should be unique", 400)
  }

  const client = await ClientRepository.getById(data.client_id)

  const offeringCategory = await OfferingCategoryRepository.getById(data.offering_category_id)
  if (offeringCategory === null) {
    throw new CustomError("Category not found", 400)
  }

  const currency = await CurrencyRepository.getById(data.currency_id)
  if (client === null && currency === null) {
    throw new CustomError("Currency not found", 400)
  }

  if (offering.is_active === true && !data.is_active) {
    const totalInvoices = await InvoiceRepository.countAllByFilters({
      invoice_status: {
        in: [InvoiceStatus.DRAFT, InvoiceStatus.BILLED, InvoiceStatus.VIEWED],
      },
      invoice_details: {
        some: {
          offering_id: offering.id,
        },
      },
    })

    if (totalInvoices > 0) {
      throw new CustomError(
        "Unable to update. This item is currently referenced in invoices that are in draft, billed, or viewed status.",
        400
      )
    }
  }

  const currentDate = new Date()

  return await OfferingRepository.updateById(offering.id, {
    name: data.name,
    client_id: client?.id ?? null,
    offering_category_id: offeringCategory.id,
    offering_type: "service",
    currency_id: client !== null ? client.currencies?.id : currency?.id,
    price: data.price,
    description: data.description,
    is_active: data.is_active,
    updated_at: currentDate,
  })
}

export const deleteById = async (id: number) => {
  const offering = await OfferingRepository.getById(id)

  if (offering === null) {
    throw new CustomError("Offering not found", 400)
  }

  if (offering._count.invoice_details > 0) {
    throw new CustomError("This service is linked to an invoice and cannot be deleted.", 400)
  }

  await OfferingRepository.deleteById(id)
}
