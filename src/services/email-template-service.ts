import { type Prisma } from "@prisma/client"
import * as EmailTemplateRepository from "../repositories/email-template-repository"
import { type EmailTemplate } from "../types/email-template-type"
import CustomError from "../utils/custom-error"
import { removeWhitespace } from "../utils/format-string"

export const getDefault = async () => {
  return await EmailTemplateRepository.getDefault()
}

export const getDefaultByTemplateType = async (template_type: string) => {
  const emailTemplate = await EmailTemplateRepository.getByTemplateType(template_type)

  if (emailTemplate === null) {
    throw new CustomError("Template not found", 400)
  }

  return emailTemplate
}

export const getRatingTemplates = async () => {
  return await EmailTemplateRepository.getRatingTemplates()
}

export const getTemplateTypes = async () => {
  return await EmailTemplateRepository.getTemplateTypes()
}

export const getById = async (id: number) => {
  return await EmailTemplateRepository.getById(id)
}

export const getAllByFilters = async (
  name: string,
  template_type: string,
  is_default: string,
  system_name: string,
  page: string
) => {
  const templateType = template_type === "all" ? undefined : template_type

  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage
  const isDefaultSet = is_default === undefined ? undefined : is_default === "true"

  const where: Prisma.email_templatesWhereInput = {
    name: {
      contains: name,
    },
    template_type: {
      equals: templateType,
    },
    is_default: isDefaultSet,
  }

  if (system_name !== undefined) {
    Object.assign(where, {
      OR: [
        {
          system_name: null,
        },
        {
          system_name,
        },
      ],
    })
  }

  const totalItems = await EmailTemplateRepository.countByFilters(where)
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const emailTemplates = await EmailTemplateRepository.getAllByFilters(
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
    data: emailTemplates,
    pageInfo,
  }
}

export const create = async (data: EmailTemplate) => {
  const existingEmailTemplate = await EmailTemplateRepository.getByName(removeWhitespace(data.name))
  if (existingEmailTemplate !== null) {
    throw new CustomError("Message Template name should be unique", 400)
  }
  return await EmailTemplateRepository.create(data)
}

export const updateById = async (id: number, data: EmailTemplate) => {
  const emailTemplate = await EmailTemplateRepository.getById(id)

  if (emailTemplate === null) {
    throw new CustomError("Invalid id.", 400)
  }

  const existingEmailTemplate = await EmailTemplateRepository.getByName(removeWhitespace(data.name))
  if (existingEmailTemplate !== null) {
    if (existingEmailTemplate.id !== emailTemplate.id) {
      throw new CustomError("Message Template name should be unique", 400)
    }
  }

  return await EmailTemplateRepository.updateById(id, data)
}

export const deleteById = async (id: number) => {
  const emailTemplate = await EmailTemplateRepository.getById(id)

  if (emailTemplate === null) {
    throw new CustomError("Invalid id", 400)
  }

  if (emailTemplate.is_default === true) {
    throw new CustomError("Unable to delete default template", 400)
  }

  await EmailTemplateRepository.deleteById(id)
}
