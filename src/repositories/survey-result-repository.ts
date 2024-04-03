import prisma from "../utils/prisma"
import { type Prisma } from "@prisma/client"

export const createMany = async (data: Prisma.survey_resultsUncheckedCreateInput[]) => {
  return await prisma.survey_results.createMany({
    data,
  })
}

export const getById = async (id: number) => {
  return await prisma.survey_results.findUnique({
    where: {
      id,
    },
  })
}

export const getAllByFilters = async (where: Prisma.survey_resultsWhereInput) => {
  return await prisma.survey_results.findMany({
    select: {
      id: true,
      user_id: true,
      external_respondent_id: true,
      status: true,
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      survey_administration_id: true,
      survey_answers: {
        include: {
          survey_template_answers: {
            include: {
              survey_template_categories: true,
            },
          },
        },
        orderBy: {
          survey_template_answers: {
            sequence_no: "asc",
          },
        },
      },
    },
    where,
  })
}

export const getByFilters = async (where: Prisma.survey_resultsWhereInput) => {
  return await prisma.survey_results.findFirst({
    where,
  })
}

export const updateStatusById = async (id: number, status: string) => {
  return await prisma.survey_results.update({
    where: {
      id,
    },
    data: {
      status,
      updated_at: new Date(),
    },
  })
}

export const updateById = async (id: number, data: Prisma.survey_answersUpdateInput) => {
  await prisma.survey_results.update({
    where: {
      id,
    },
    data,
  })
}

export const updateStatusByAdministrationId = async (
  survey_administration_id: number,
  status: string
) => {
  await prisma.survey_results.updateMany({
    where: {
      survey_administration_id,
    },
    data: {
      status,
    },
  })
}

export const deleteById = async (id: number) => {
  await prisma.survey_results.delete({
    where: {
      id,
    },
  })
}
