import prisma from "../utils/prisma"

export const getAllBySkillName = async (name: string) => {
  return await prisma.project_skills.findMany({
    where: {
      skills: {
        name: {
          contains: name,
        },
      },
    },
  })
}
