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
  const emailTemplates = [
    {
      name: "Create Evaluation Administration Template",
      template_type: "Create Evaluation",
      is_default: true,
      subject: "Request for Evaluation",
      content: `Dear Evaluator,\n\nGood day!\n\nAs part of our commitment to professional development and fostering a culture of feedback, we are reaching out to request for you to evaluate the performance your respective colleagues during this period: {{evaluation_period}}.\n\nPlease click this {{link}} to access {{evaluation_name}}. {{passcode}}\n\nFeel free to add any additional comments or insights you believe are relevant. Your insights are invaluable in providing an understanding of each persons's contributions and areas for growth to help enhance their performance and contribute effectively to the overall success of the team.\n\nThe deadline for completing these evaluations is on {{eval_schedule_end_date}}. If you encounter any technical issues or have questions regarding the process, please feel free to reach out to any of the HR team members at hr@nerubia.com.\n\nThank you for your dedication to fostering a culture of continuous improvement within our company.`,
    },
    {
      name: "Reset Verification Code Email",
      template_type: "Reset Verification Code",
      is_default: true,
      subject: "Your KH360 Verification Code",
      content: `We recently received a request for a new verification code.\nYour verification code is: {{verification_code}}\n\nPlease use this code to complete the Performance Evaluation Form. If you didn't request this code or are experiencing any issues, feel free to contact our HR Team at hr@nerubia.com.\n\nThank you.`,
    },
    {
      name: "Performance Evaluation Reminder Email",
      template_type: "Performance Evaluation Reminder",
      is_default: true,
      subject: "Friendly Reminder: Complete Your Performance Evaluation",
      content: `Dear {{evaluator_first_name}},\n\nI hope this email finds you well. We appreciate your valuable contribution to our performance evaluation process. However, it seems that your feedback is still pending for the following:\n\n{{evaluee_list}}\n\nCompleting the evaluation is crucial for fostering growth and continuous improvement within our team. Your insights are instrumental in shaping a well-rounded assessment.\n\nCould you please take a few moments to finalize and submit your performance evaluation? Your input is highly valued and plays a significant role in recognizing achievements and identifying areas for development.\n\nDeadline for Completion: {{evaluation_end_date}}\n\nIf you have already completed the evaluation, please disregard this message, and we extend our heartfelt gratitude for your prompt response.\n\nThank you for your commitment to our shared success. If you encounter any issues or have questions, feel free to reach out to hr@nerubia.com.\n\nBest regards,\n\nKH360 Team`,
    },
    {
      name: "Performance Evaluation NA Rating - Ninja",
      template_type: "Performance Evaluation NA Rating",
      is_default: false,
      subject: "🤷‍♂️ Whoa, N.A. Ninja! 🤷‍♀️",
      content: `Looks like we've hit the Not Applicable zone! 🚀 No worries, we're all about turning every experience into a win.\n\n🌈 Drop a comment below and let us in on the mystery – why the N.A.? 🕵️‍♂️ Your insights could be the missing puzzle piece! 🧩\n✨ Share a laugh, a thought, or your favorite emoji – the comment section is your playground! 🎉💬\n\n#CommentForClarity`,
    },
    {
      name: "Performance Evaluation NA Rating - Magician",
      template_type: "Performance Evaluation NA Rating",
      is_default: false,
      subject: `🎩✨ Magician of the Mysterious "N.A."! ✨🔍`,
      content: `Well, well, well, looks like we've stumbled upon the enigmatic realm of Not Applicable! 🌌\n\n✨ But fear not, oh keeper of secrets! Your comment is the golden key to unlocking the mysteries of this rating. 🗝️\n🤔 What's the tale behind the N.A.? Share your wizardry in the comment cauldron below! 🧙‍♂️💬 Let the magic unfold! ✨🚀\n\n#UnveilTheNAMagic`,
    },
    {
      name: "Performance Evaluation NA Rating - Cosmic Universe",
      template_type: "Performance Evaluation NA Rating",
      is_default: false,
      subject: `🌟 Aloha, Trailblazer of the "N.A." Universe! 🚀🌈`,
      content: `Guess what? We've embarked on a cosmic journey into the realm of Not Applicable! 🌌\n\n✨ But fret not, cosmic traveler! Your comment is the stardust we need to illuminate this uncharted territory. 🌠\n✍️ What's the untold story behind the N.A.? Unleash your creativity in the comment constellation below! 🎇💬 Let's turn this unknown into an epic adventure! 🚀🌠\n\n#DecodeTheCosmicN.A.`,
    },
    {
      name: "Performance Evaluation NA Rating - Sailor Captain",
      template_type: "Performance Evaluation NA Rating",
      is_default: false,
      subject: `🎉 Greetings, Captain of the Not-So-Applicable Ship! 🚢✨`,
      content: `Ahoy there! We've spotted the mystical "N.A." on our rating radar! 🌌\n\n🤔 But fear not, intrepid explorer! Your comment is the treasure map we need to navigate this uncharted territory. 🗺️\n🧭 What's the story behind the Not Applicable rating? Share your seafaring wisdom in the comment seas below! 🌊💬 Let's turn this unknown into a legendary tale on the high seas of feedback! 🏴‍☠️🚀\n\n#SailIntoTheNAMystery`,
    },
    {
      name: "Performance Evaluation NA Rating - Galactic Explorer",
      template_type: "Performance Evaluation NA Rating",
      is_default: false,
      subject: `🚀 Greetings, Galactic Explorer of the Not-So-Applicable Cosmos! 🌌🌠`,
      content: `Hold tight, space traveler! We've just entered the mysterious realm of "N.A." on our cosmic feedback journey! 🛸\n\n🤔 But don't let the unknown scare you – your comment is the warp drive we need to navigate this interstellar puzzle. 🌐\n💬 What's the cosmic story behind the Not Applicable rating? Unleash your celestial musings in the comment nebula below! 🌌✨ Let's turn this cosmic conundrum into an epic saga of intergalactic feedback! 🌠🚀\n\n#ExploreTheNAGalaxy`,
    },
    {
      name: "Performance Evaluation High Rating - Superstar",
      template_type: "Performance Evaluation High Rating",
      is_default: false,
      subject: `🌟 Hey Superstar! 🌟`,
      content: `We noticed that you gave a stellar rating. 🌠✨\n\nCan you please comment down below why you think this person is a 🌟Superstar🌟? Share your experience, and let's keep the positivity flowing! 🌈✨\n\n😃 #CommentToCelebrate`,
    },
    {
      name: "Performance Evaluation Low Rating - Maverick",
      template_type: "Performance Evaluation Low Rating",
      is_default: false,
      subject: `🚨 Whoa there, Maverick! 🚨`,
      content: `We just noticed that the ratings are a bit shy on the stars. 🌟\n\nWe're all about turning frowns upside down, so please drop a comment below because we believe your input can work wonders! 🧙‍♂️✨ We're all ears (and emojis)! 🗨️💬\n\n😃 #CommentToElevate`,
    },
  ]
  for (const data of emailTemplates) {
    const emailTemplate = await prisma.email_templates.findFirst({
      where: {
        name: data.name,
        template_type: data.template_type,
      },
    })
    if (emailTemplate === null) {
      await prisma.email_templates.create({
        data,
      })
    }
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
          answer_type: AnswerType.Highest,
        },
      })
    }
  }
}

async function main() {
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
  await setAnswerTypes()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
