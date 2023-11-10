import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

/**
 * List evaluation template contents based on provided filters.
 * @param req.query.evaluation_id - Filter by evaluation id.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const { evaluation_id } = req.query

    const evaluation = await prisma.evaluations.findUnique({
      where: {
        id: parseInt(evaluation_id as string),
      },
    })

    const evaluationTemplateContents =
      await prisma.evaluation_template_contents.findMany({
        select: {
          id: true,
          name: true,
          description: true,
        },
        where: {
          evaluation_template_id: evaluation?.evaluation_template_id,
        },
      })

    const finalEvaluationTemplateContents = await Promise.all(
      evaluationTemplateContents.map(async (templateContent) => {
        const answerOptionsType = await prisma.evaluation_templates.findUnique({
          select: {
            answer_id: true,
          },
          where: {
            id: evaluation?.evaluation_template_id as number,
          },
        })
        const answerOptions = await prisma.answer_options.findMany({
          select: {
            id: true,
            sequence_no: true,
          },
          where: {
            answer_id: answerOptionsType?.answer_id,
            is_active: true,
          },
        })

        const evaluationRating = await prisma.evaluation_ratings.findFirst({
          select: {
            id: true,
            answer_option_id: true,
          },
          where: {
            evaluation_id: evaluation?.id,
            evaluation_template_content_id: templateContent.id,
          },
        })

        if (
          evaluationRating?.answer_option_id !== null &&
          evaluationRating?.answer_option_id !== undefined
        ) {
          const ratingSequenceNumber = await prisma.answer_options.findUnique({
            select: {
              sequence_no: true,
            },
            where: {
              id: evaluationRating?.answer_option_id ,
            },
          })
          Object.assign(evaluationRating as Record<string, unknown>, {
            ratingSequenceNumber: ratingSequenceNumber?.sequence_no,
          })
        }

        return {
          id: templateContent.id,
          name: templateContent.name,
          description: templateContent.description,
          eval_start_date: evaluation?.eval_start_date,
          eval_end_date: evaluation?.eval_end_date,
          evaluationRating,
          answerId: answerOptionsType?.answer_id,
          answerOptions,
        }
      })
    )

    res.json(finalEvaluationTemplateContents)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
