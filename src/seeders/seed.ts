import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"
import { EvaluationAdministrationStatus } from "../types/evaluation-administration-type"
import { EvaluationResultStatus } from "../types/evaluation-result-type"
import { Environment } from "../types/environment-type"
import { AnswerType } from "../types/answer-type"

const prisma = new PrismaClient()

/**
 * Local
 */

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

const createEvaluationResults = async () => {
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

/**
 * Production
 */

const createRoles = async () => {
  const roles = [
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
  ]
  for (const role of roles) {
    const existingRole = await prisma.user_roles.findFirst({
      where: {
        name: role.name,
        user_id: role.user_id,
      },
    })
    if (existingRole === null) {
      await prisma.user_roles.create({
        data: role,
      })
    }
  }
}

const createEmailTemplates = async () => {
  const emailTemplate = await prisma.email_templates.findFirst({
    where: {
      template_type: "Create Evaluation",
    },
  })
  if (emailTemplate === null) {
    await prisma.email_templates.create({
      data: {
        name: "Create Evaluation Administration Template",
        template_type: "Create Evaluation",
        is_default: true,
        subject: "Request for Evaluation",
        content: `Dear Evaluator,\n\nGood day!\n\nAs part of our commitment to professional development and fostering a culture of feedback, we are reaching out to request for you to evaluate the performance your respective colleagues during this period: {{evaluation_period}}.\n\nPlease click this {{link}} to access {{evaluation_name}}. {{passcode}}\n\nFeel free to add any additional comments or insights you believe are relevant. Your insights are invaluable in providing an understanding of each persons's contributions and areas for growth to help enhance their performance and contribute effectively to the overall success of the team.\n\nThe deadline for completing these evaluations is on {{eval_schedule_end_date}}. If you encounter any technical issues or have questions regarding the process, please feel free to reach out to any of the HR team members at hr@nerubia.com.\n\nThank you for your dedication to fostering a culture of continuous improvement within our company.`,
      },
    })
  }
}

const setAnswerTypes = async () => {
  const answerOptions = await prisma.answer_options.findMany()

  for (const answerOption of answerOptions) {
    if (answerOption.id === 1) {
      await prisma.answer_options.update({
        where: {
          id: answerOption.id,
        },
        data: {
          answer_type: AnswerType.NA,
        },
      })
    } else if (answerOption.id === 2) {
      await prisma.answer_options.update({
        where: {
          id: answerOption.id,
        },
        data: {
          answer_type: AnswerType.Lowest,
        },
      })
    } else if (answerOption.id === 6) {
      await prisma.answer_options.update({
        where: {
          id: answerOption.id,
        },
        data: {
          answer_type: AnswerType.Lowest,
        },
      })
    }
  }
}

async function main() {
  await setAnswerTypes()
  if (process.env.APP_ENV === Environment.Production) {
    await createRoles()
    await createEmailTemplates()
  }
  if (process.env.APP_ENV === Environment.Local) {
    await createUsers()
    await createEvaluations()
    await createUserDetails()
    await createEvaluationResults()
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
