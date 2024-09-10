import { type Prisma } from "@prisma/client"
import * as ContractRepository from "../../repositories/contract-repository"
import { ContractStatus } from "../../types/contract-type"

export const getAllByFilters = async (client_id: number, active: boolean, page: string) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.contractsWhereInput = {}

  if (client_id !== undefined) {
    Object.assign(where, {
      client_id,
    })
  }

  if (active) {
    Object.assign(where, {
      status: {
        notIn: [ContractStatus.DRAFT, ContractStatus.NO_GO, ContractStatus.CANCELLED],
      },
    })
  }

  const contracts = await ContractRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const totalItems = await ContractRepository.countAllByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return {
    data: contracts,
    pageInfo: {
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      currentPage,
      totalPages,
      totalItems,
    },
  }
}
