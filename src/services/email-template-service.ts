import * as EmailTemplateRepository from "../repositories/email-template-repository"
import { type EmailTemplate } from "../types/email-template-type"
import CustomError from "../utils/custom-error"

export const getDefault = async () => {
  return await EmailTemplateRepository.getDefault()
}

export const getByTemplateType = async (template_type: string) => {
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
  page: string
) => {
  const templateType = template_type === "all" ? "" : template_type

  const itemsPerPage = 20
  const parsedPage = parseInt(page)
  const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage
  const isDefaultSet = is_default === undefined ? undefined : is_default === "true"

  const where = {
    name: {
      contains: name,
    },
    template_type: {
      contains: templateType,
    },
    is_default: isDefaultSet,
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
  return await EmailTemplateRepository.create(data)
}

export const updateById = async (id: number, data: EmailTemplate) => {
  const emailTemplate = await EmailTemplateRepository.getById(id)

  if (emailTemplate === null) {
    throw new CustomError("Invalid id.", 400)
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
