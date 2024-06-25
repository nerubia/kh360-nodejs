export const parseSkillMapData = (skillData: string, rating: string) => {
  if (skillData.includes("]")) {
    const regex = /^(.*?)\s*\[(.*?)\]\s*$/
    const match = skillData.match(regex)
    if (match !== null) {
      return {
        category: match[1].trim(),
        skill: match[2].trim(),
        rating,
      }
    }
  }
  return null
}
