import { object, array, number, string } from "yup"
import * as AnswerOptionService from "../../../services/answer-option-service"
import { EvaluationStatus } from "../../../types/evaluation-type"
import { AnswerType } from "../../../types/answer-type"

export const submitEvaluationSchema = object().shape({
  answer_option_ids: array()
    .of(number().required("Please set all ratings."))
    .test("all-ratings-set", "Please set all ratings.", function (value) {
      if (value !== undefined) {
        return value?.every((id) => id !== null)
      }
      return true
    }),
  comment: string().test("comment-required", "Comment is required.", async function (value) {
    if (value !== undefined) {
      const { answer_option_ids } = this.parent

      const finalAnswerOptionIds = answer_option_ids?.filter((id: number) => id !== null)
      const answerOptions = []
      for (const id of finalAnswerOptionIds) {
        const answerOption = await AnswerOptionService.getById(id)
        if (answerOption !== null) {
          answerOptions.push(answerOption)
        }
      }

      const highestCount = answerOptions.filter(
        (rating) => rating.answer_type === AnswerType.Highest
      ).length
      const lowestCount = answerOptions.filter(
        (rating) => rating.answer_type === AnswerType.Lowest
      ).length

      const highestCountPercentage = (highestCount / answer_option_ids.length) * 100
      const lowestCountPercentage = (lowestCount / answer_option_ids.length) * 100

      const isCommentRequired =
        answerOptions.length > 0 &&
        (highestCountPercentage >= 75 || lowestCountPercentage >= 75) &&
        (value?.trim().length === 0 || value === null)
      return !isCommentRequired
    }

    return true
  }),
  evaluation: object()
    .shape({
      evaluator_id: number().test(
        "user-not-allowed",
        "You do not have permission to answer this.",
        function (value) {
          if (value !== undefined) {
            const user = this.options.context?.user
            return value === user.id
          }
          return true
        }
      ),
      status: string().oneOf(
        [EvaluationStatus.Open, EvaluationStatus.Ongoing],
        "Only open and ongoing statuses are allowed."
      ),
    })
    .required("Invalid id"),
  comments: string().test(
    "rating-comment-required",
    "Comment is required on N/A ratings.",
    function (value) {
      if (value !== undefined) {
        const { answerOption } = this.parent

        if (answerOption?.answer_type === "na") {
          return value.length > 0
        }
      }
      return true
    }
  ),
})
