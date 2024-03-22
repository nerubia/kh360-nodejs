import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"
import { type SurveyAdministrationType } from "../types/survey-administration-type"

export const getById = async (id: number) => {
  return await prisma.survey_administrations.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.survey_administrationsWhereInput) => {
  return await prisma.survey_administrations.findMany({
    where,
  })
}

export const getAllByStatusAndDate = async (status: string, date: Date) => {
  return await prisma.survey_administrations.findMany({
    where: {
      status,
      survey_start_date: {
        lte: date,
      },
      survey_end_date: {
        gte: date,
      },
    },
  })
}

export const getAllByStatusAndEndDate = async (status: string, date: Date) => {
  return await prisma.survey_administrations.findMany({
    where: {
      status,
      survey_end_date: {
        lte: date,
      },
    },
  })
}

export const paginateByFilters = async (
  skip: number,
  take: number,
  where: Prisma.survey_administrationsWhereInput
) => {
  return await prisma.survey_administrations.findMany({
    skip,
    take,
    where,
    orderBy: {
      id: "desc",
    },
  })
}

export const countAllByFilters = async (where: Prisma.survey_administrationsWhereInput) => {
  const count = await prisma.survey_administrations.count({
    where,
  })

  return count
}

export const create = async (data: SurveyAdministrationType) => {
  return await prisma.survey_administrations.create({
    data: {
      ...data,
      created_at: new Date(),
    },
    select: {
      id: true,
      name: true,
      survey_start_date: true,
      survey_end_date: true,
      survey_template_id: true,
      remarks: true,
      email_subject: true,
      email_content: true,
    },
  })
}
export const updateById = async (id: number, data: SurveyAdministrationType) => {
  return await prisma.survey_administrations.update({
    where: {
      id,
    },
    data: {
      ...data,
      updated_at: new Date(),
    },
    select: {
      id: true,
      name: true,
      survey_start_date: true,
      survey_end_date: true,
      survey_template_id: true,
      remarks: true,
      email_subject: true,
      email_content: true,
    },
  })
}
export const deleteById = async (id: number) => {
  return await prisma.survey_administrations.delete({
    where: {
      id,
    },
  })
}

export const updateStatusById = async (id: number, status: string) => {
  return await prisma.survey_administrations.update({
    where: {
      id,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}
