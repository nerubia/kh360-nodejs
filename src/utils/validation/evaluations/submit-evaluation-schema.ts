import { object, array, number, string } from "yup"
import * as AnswerOptionService from "../../../services/answer-option-service"
import { EvaluationStatus } from "../../../types/evaluation-type"

export const submitEvaluationSchema = object().shape({
  answerOptionIds: array()
    .of(number().required("Please set all ratings."))
    .test("all-ratings-set", "Please set all ratings.", function (value) {
      if (value !== undefined) {
        return value?.every((id) => id !== null)
      }
      return true
    }),
  comment: string().test("comment-required", "Comment is required.", async function (value) {
    if (value !== undefined) {
      const { answerOptionIds } = this.parent

      const finalAnswerOptionIds = answerOptionIds?.filter((id: number) => id !== null)
      const answerOptions = await AnswerOptionService.getAllByFilters({
        id: {
          in: finalAnswerOptionIds,
        },
      })

      const isCommentRequired =
        answerOptions.length > 0 &&
        answerOptions?.every((answer) => answer.sequence_no === 2) &&
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
