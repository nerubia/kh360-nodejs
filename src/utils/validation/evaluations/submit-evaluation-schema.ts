import { object, array, number, string } from "yup"
import * as AnswerOptionService from "../../../services/answer-option-service"
import { EvaluationStatus } from "../../../types/evaluation-type"

export const submitEvaluationSchema = object().shape({
  answerOptionIds: array()
    .of(number().required("Please set all ratings"))
    .test("all-ratings-set", "Please set all ratings", function (value) {
      return value?.every((id) => id !== null)
    }),
  comment: string().test("comment-required", "Comment is required.", async function (value) {
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
  }),
  evaluation: object()
    .shape({
      evaluator_id: number()
        .required()
        .test("user-not-allowed", "You do not have permission to answer this.", function (value) {
          const user = this.options.context?.user
          return value === user.id
        }),
      status: string().oneOf(
        [EvaluationStatus.Open, EvaluationStatus.Ongoing],
        "Only open and ongoing statuses are allowed"
      ),
    })
    .required("Invalid id"),
})
