import { type Decimal } from "@prisma/client/runtime/library"
import prisma from "../utils/prisma"

export const getById = async (id: number) => {
  return await prisma.score_ratings.findUnique({
    select: {
      display_name: true,
      evaluee_description: true,
    },
    where: {
      id,
    },
  })
}

export const getByScore = async (score: Decimal) => {
  return await prisma.score_ratings.findFirst({
    where: {
      min_score: {
        lte: score,
      },
      max_score: {
        gte: score,
      },
    },
  })
}
