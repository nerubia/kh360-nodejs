import { type Request, type Response } from "express"
import prisma from "../../utils/prisma"

export const getEvaluees = async (req: Request, res: Response) => {
  try {
    const { evaluation_administration_id, name, status, page } = req.query

    const evaluationResultStatus = status === "all" ? "" : status

    const itemsPerPage = 20
    const parsedPage = parseInt(page as string)
    const currentPage = isNaN(parsedPage) || parsedPage < 0 ? 1 : parsedPage

    const where = {
      evaluation_administration_id: parseInt(
        evaluation_administration_id as string
      ),
      status: {
        contains: evaluationResultStatus as string,
      },
    }

    if (name !== undefined) {
      Object.assign(where, {
        users: {
          OR: [
            {
              first_name: {
                contains: name as string,
              },
            },
            {
              last_name: {
                contains: name as string,
              },
            },
          ],
        },
      })
    }

    const evaluationResults = await prisma.evaluation_results.findMany({
      skip: (currentPage - 1) * itemsPerPage,
      take: itemsPerPage,
      select: {
        id: true,
        status: true,
        users: {
          select: {
            slug: true,
            first_name: true,
            last_name: true,
            picture: true,
          },
        },
      },
      where,
      orderBy: [
        {
          users: {
            last_name: "asc",
          },
        },
        {
          users: {
            first_name: "asc",
          },
        },
      ],
    })

    const totalItems = await prisma.evaluation_results.count({
      where,
    })

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    res.json({
      data: evaluationResults,
      pageInfo: {
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        totalPages,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const deleteEvaluee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.evaluation_results.deleteMany({
      where: {
        id: parseInt(id),
      },
    })
    await prisma.evaluations.deleteMany({
      where: {
        evaluation_result_id: parseInt(id),
      },
    })
    res.json({ id })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
