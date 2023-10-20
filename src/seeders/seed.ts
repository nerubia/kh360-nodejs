import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

const createUsers = async () => {
  const userList = [
    {
      email: "jlerit@nerubia.com",
      first_name: "J",
      last_name: "admin",
      picture: faker.internet.avatar(),
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
  ]
  for (let i = 0; i < 200; i++) {
    userList.push({
      email: `email${i}@gmail.com`,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      picture: faker.internet.avatar(),
    })
  }
  await prisma.users.createMany({
    data: userList,
    skipDuplicates: true,
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

const createUserDetails = async () => {
  await prisma.user_details.createMany({
    data: [
      {
        user_type: "Regular",
        user_position: "Project Manager",
        user_id: 4,
      },
      {
        user_type: "Probationary",
        user_position: "Quality Assurance",
        user_id: 5,
      },
      {
        user_type: "Intern",
        user_position: "Developer",
        user_id: 6,
      },
    ],
  })
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

export const createEvaluationResults = async () => {
  const evaluationResults = []
  const userCount = await prisma.users.count()
  for (let i = 1; i <= userCount; i++) {
    evaluationResults.push({
      evaluation_administration_id: 1,
      user_id: i,
      status: faker.helpers.arrayElement(["reviewed", "pending", "draft"]),
    })
  }
  await prisma.evaluation_results.createMany({
    data: evaluationResults,
  })
}

async function main() {
  await createUsers()
  await createRoles()
  await createEvaluations()
  await createEmailTemplates()
  await createUserDetails()
  await createEvaluationResults()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
