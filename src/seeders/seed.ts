import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"
import { EvaluationAdministrationStatus } from "../types/evaluationAdministrationType"
import { EvaluationResultStatus } from "../types/evaluationResultType"

const prisma = new PrismaClient()

const createUsers = async () => {
  const userList = [
    {
      slug: "j-admin",
      email: "jlerit@nerubia.com",
      first_name: "J",
      last_name: "admin",
      picture: faker.internet.avatar(),
      is_active: true,
    },
    {
      slug: "cat-admin",
      email: "eacha@nerubia.com",
      first_name: "Cat",
      last_name: "admin",
      picture: faker.internet.avatar(),
      is_active: true,
    },
    {
      slug: "nino-admin",
      email: "nardiente@nerubia.com",
      first_name: "Nino",
      last_name: "admin",
      picture: faker.internet.avatar(),
      is_active: true,
    },
  ]
  for (let i = 0; i < 200; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    userList.push({
      slug: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      email: `email${i}@gmail.com`,
      first_name: firstName,
      last_name: lastName,
      picture: faker.internet.avatar(),
      is_active: true,
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
      {
        name: "khv2_hr_evaluators",
        user_id: 15,
      },
      {
        name: "khv2_hr_evaluators",
        user_id: 86,
      },
      {
        name: "khv2_hr_evaluators",
        user_id: 20032,
      },
      {
        name: "khv2_hr_evaluators",
        user_id: 20090,
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
        status: faker.helpers.enumValue(EvaluationAdministrationStatus),
        created_at: new Date(),
      },
    })
  }
}

const createUserDetails = async () => {
  const userDetailsList = []
  const userTypes = ["Probationary", "Regular", "Intern"]
  const userCount = await prisma.users.count()
  for (let i = 0; i < userCount; i++) {
    userDetailsList.push({
      user_id: i,
      user_type: userTypes[Math.floor(Math.random() * userTypes.length)],
      user_position: faker.person.jobTitle(),
      start_date: faker.date.past(),
    })
  }
  await prisma.user_details.createMany({
    data: userDetailsList,
    skipDuplicates: true,
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
      status: faker.helpers.enumValue(EvaluationResultStatus),
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
