import { type Request, type Response } from "express"
import * as ScoreRatingService from "../../services/score-rating-service"

/**
 * List score ratings.
 */
export const index = async (req: Request, res: Response) => {
  try {
    const results = await ScoreRatingService.getScoreRatings()
    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}
