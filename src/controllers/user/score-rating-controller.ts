import { type Request, type Response } from "express"
import * as ScoreRatingService from "../../services/score-rating-service"
import logger from "../../utils/logger"

/**
 * List score ratings.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const results = await ScoreRatingService.getScoreRatings()
    res.json(results)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ message: "Something went wrong" })
  }
}
