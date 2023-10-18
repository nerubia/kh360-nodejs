import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

const fakeEvaluations = () => ({
  name: faker.word.sample(),
  eval_schedule_start_date: faker.date.anytime(),
  eval_schedule_end_date: faker.date.anytime(),
  eval_period_start_date: faker.date.anytime(),
  eval_period_end_date: faker.date.anytime(),
  status: faker.helpers.arrayElement(["completed", "ongoing", "draft"]),
  created_at: new Date(),
})

async function main() {
  const fakerRounds = 200

  /* Create fake evaluation_administrations */
  for (let i = 0; i < fakerRounds; i++) {
    await prisma.evaluation_administrations.create({ data: fakeEvaluations() })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
