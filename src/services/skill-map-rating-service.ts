import * as SkillMapRatingRepository from "../repositories/skill-map-rating-repository"

export const updateStatusByAdministrationId = async (
  skill_map_administration_id: number,
  status: string
) => {
  await SkillMapRatingRepository.updateStatusByAdministrationId(skill_map_administration_id, status)
}
