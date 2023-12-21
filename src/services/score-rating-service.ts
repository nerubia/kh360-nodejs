import * as ScoreRatingRepository from "../repositories/score-rating-repository"

export const getScoreRatings = async () => {
  return await ScoreRatingRepository.getScoreRatings()
}
