import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

const createUsers = async () => {
  await prisma.users.createMany({
    data: [
      {
        email: "jlerit@nerubia.com",
        first_name: "J",
        last_name: "admin",
      },
      {
        email: "eacha@nerubia.com",
        first_name: "Cat",
        last_name: "admin",
      },
      {
        email: "nardiente@nerubia.com",
        first_name: "Nino",
        last_name: "admin",
      },
    ],
  })
}

const createRoles = async () => {
  await prisma.user_roles.createMany({
    data: [
      {
        name: "kh360",
        user_id: 1,
      },
      {
        name: "kh360",
        user_id: 2,
      },
      {
        name: "kh360",
        user_id: 3,
      },
    ],
  })
}

const createEvaluations = async () => {
  for (let i = 0; i < 200; i++) {
    await prisma.evaluation_administrations.create({
      data: {
        name: faker.word.sample(),
        eval_schedule_start_date: faker.date.anytime(),
        eval_schedule_end_date: faker.date.anytime(),
        eval_period_start_date: faker.date.anytime(),
        eval_period_end_date: faker.date.anytime(),
        status: faker.helpers.arrayElement(["completed", "ongoing", "draft"]),
        created_at: new Date(),
      },
    })
  }
}

export const createEmailTemplates = async () => {
  await prisma.email_templates.createMany({
    data: [
      {
        template_type: "Create Evaluation",
        is_default: true,
        subject: "Subject 1",
        content: "Content 1",
      },
      {
        template_type: "Another Evaluation",
        is_default: true,
        subject: "Subject 2",
        content: "Content 2",
      },
    ],
  })
}

async function main() {
  await createUsers()
  await createRoles()
  await createEvaluations()
  await createEmailTemplates()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
