import { type Prisma } from "@prisma/client"
import * as ClienRepository from "../repositories/client-repository"
import * as ProjectRepository from "../repositories/project-repository"
import * as ProjectSkillRepository from "../repositories/project-skill-repository"

export const getById = async (id: number) => {
  return await ProjectRepository.getById(id)
}

export const getAllByFilters = async (name: string) => {
  const where = {
    name: {
      contains: name,
    },
  }
  return await ProjectRepository.getAllByFilters(where)
}

export const paginateByFilters = async (
  name?: string,
  client?: string,
  skills?: string,
  status?: string,
  page?: string
) => {
  const itemsPerPage = 20
  const parsedPage = parseInt(page as string)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

  const where: Prisma.projectsWhereInput = {}

  if (name !== undefined) {
    Object.assign(where, {
      name: {
        contains: name,
      },
    })
  }

  if (client !== undefined) {
    const clients = await ClienRepository.getAllByName(client)
    const clientids = clients.map((c) => c.id)
    Object.assign(where, {
      client_id: {
        in: clientids,
      },
    })
  }

  if (skills !== undefined) {
    const projectSkills = await ProjectSkillRepository.getAllBySkillName(skills)
    const projectIds = projectSkills.map((projectSkill) => projectSkill.project_id)
    Object.assign(where, {
      id: {
        in: projectIds,
      },
    })
  }

  if (status !== undefined && status !== "all") {
    Object.assign(where, {
      status,
    })
  }

  const totalItems = await ProjectRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const projects = await ProjectRepository.paginateByFilters(
    (currentPage - 1) * itemsPerPage,
    itemsPerPage,
    where
  )

  const pageInfo = {
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    totalPages,
    totalItems,
  }

  return {
    data: projects,
    pageInfo,
  }
}
