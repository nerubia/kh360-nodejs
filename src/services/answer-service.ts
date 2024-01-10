import * as AnswerRepository from "../repositories/answer-repository"

export const gettActiveAnswers = async () => {
  return await AnswerRepository.list(true)
}
