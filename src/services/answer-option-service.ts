import { type Prisma } from "@prisma/client"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"

export const getById = async (id: number) => {
  return await AnswerOptionRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.answer_optionsWhereInput) => {
  return await AnswerOptionRepository.getAllByFilters(where)
}
