import { type Prisma } from "@prisma/client"
import * as AnswerOptionRepository from "../repositories/answer-option-repository"
import * as AnswerRepository from "../repositories/answer-repository"
import CustomError from "../utils/custom-error"

export const getById = async (id: number) => {
  return await AnswerOptionRepository.getById(id)
}

export const getAllByFilters = async (where: Prisma.answer_optionsWhereInput) => {
  return await AnswerOptionRepository.getAllByFilters(where)
}

export const getAllByAnswerName = async (answer_name: string) => {
  const answer = await AnswerRepository.getByFilters({ name: answer_name })

  if (answer === null) {
    throw new CustomError("Answer not found", 400)
  }

  return await AnswerOptionRepository.getAllByFilters({
    answer_id: answer?.id,
  })
}
