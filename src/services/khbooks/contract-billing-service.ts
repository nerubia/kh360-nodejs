import { type Prisma } from "@prisma/client"
import * as ContractBillingRepository from "../../repositories/khbooks/contract-billing-repository"

export const getAllByFilters = async (
  client_id: number,
  start_date: string,
  end_date: string,
  contract_no: string,
  project_id: number,
  description: string,
  status: string,
  page: string
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const startDate = start_date !== undefined ? new Date(start_date) : undefined
  const endDate = end_date !== undefined ? new Date(end_date) : undefined

  const where: Prisma.contract_billingsWhereInput = {}

  if (!isNaN(client_id)) {
    Object.assign(where, {
      client_id,
    })
  }

  if (startDate !== undefined && endDate !== undefined) {
    Object.assign(where, {
      bill_date: {
        gte: startDate,
        lte: endDate,
      },
    })
  }

  if (contract_no !== undefined) {
    Object.assign(where, {
      contracts: {
        contract_no: {
          contains: contract_no,
        },
      },
    })
  }

  if (!isNaN(project_id)) {
    Object.assign(where, {
      contracts: {
        project_id,
      },
    })
  }

  if (description !== undefined) {
    Object.assign(where, {
      contracts: {
        description: {
          contains: description,
        },
      },
    })
  }

  if (status !== undefined && status !== "all") {
    Object.assign(where, {
      billing_status: status,
    })
  }

  const contractBillings = await ContractBillingRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await ContractBillingRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: contractBillings,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
