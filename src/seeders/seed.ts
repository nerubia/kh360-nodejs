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

const updateEvaluationTemplates = async () => {
  await prisma.evaluation_templates.updateMany({
    where: {
      id: {
        in: [1, 4, 6, 8],
      },
    },
    data: {
      with_recommendation: true,
    },
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
      content: `Dear Evaluator,\n\nGood day!\n\nAs part of our commitment to professional development and fostering a culture of feedback, we are reaching out to request for you to evaluate the performance your respective colleagues during this period: {{evaluation_period}}.\n\nPlease click this {{link}} to access {{evaluation_name}}. {{passcode}}\n\nFeel free to add any additional comments or insights you believe are relevant. Your insights are invaluable in providing an understanding of each persons's contributions and areas for growth to help enhance their performance and contribute effectively to the overall success of the team.\n\nThe deadline for completing these evaluations is on {{eval_schedule_end_date}}. If you encounter any technical issues or have questions regarding the process, please feel free to reach out to any of the HR team members at hr@nerubia.com.\n\nThank you for your dedication to fostering a culture of continuous improvement within our company.\n\nBest Regards,\nKH360 Team`,
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
      content: `Dear {{evaluator_first_name}},\n\nI hope this email finds you well. We appreciate your valuable contribution to our performance evaluation process. However, it seems that your feedback is still pending for the following:\n\n{{evaluee_list}}\nCompleting the evaluation is crucial for fostering growth and continuous improvement within our team. Your insights are instrumental in shaping a well-rounded assessment.\n\nCould you please take a few moments to finalize and submit your performance evaluation? Your input is highly valued and plays a significant role in recognizing achievements and identifying areas for development.\n\nDeadline for Completion: {{evaluation_end_date}}\n\nIf you have already completed the evaluation, please disregard this message, and we extend our heartfelt gratitude for your prompt response.\n\nThank you for your commitment to our shared success. If you encounter any issues or have questions, feel free to reach out to hr@nerubia.com.\n\nBest regards,\nKH360 Team`,
    },
    {
      name: "Request to Remove Evaluation",
      template_type: "Request to Remove Evaluation",
      is_default: true,
      subject: "Request to Remove Evaluation",
      content: `Dear KH360 Admin,\n\nI would like to request to remove {{evaluee_first_name}} {{evaluee_last_name}} with details below from my list of evaluees:\n\nEvaluation Type: {{template_display_name}}\n{{project name information}}\n{{project duration information}}\nComments: {{comments}}\n\nClick on this {{link}} to approve or reject this request.\n\nThanks and Best Regards,\nKH360 Team on behalf of {{evaluator first name}} {{evaluator_last_name}}`,
    },
    {
      name: "Approved Request to Remove Evaluee",
      template_type: "Approved Request to Remove Evaluee",
      is_default: true,
      subject: `Approved Request to Remove {{template_name}} of {{evaluee_first_name}} {{evaluee_last_name}}`,
      content: `Hi {{evaluator_first_name}},\n\nHope this note adds a little sunshine to your day! 🌞 Just wanted to drop you a quick line to say your request to remove your {{template_display_name}} of {{evaluee_first_name}}  {{evaluee_last_name}} {{project_details}} has been given the green light and is now removed from your list. \n\nIf you have any further questions or if there is anything else we can assist you with, please feel free to reach out. Your cooperation in this matter is highly valued, and we want to ensure that the evaluation process is as effective and meaningful as possible.\n\nThanks for making the workplace vibe even better!\n\nCheers,\nKH360 Team`,
    },
    {
      name: "Declined Request to Remove Evaluee",
      template_type: "Declined Request to Remove Evaluee",
      is_default: true,
      subject: `Declined Request to Remove {{template_name}} of {{evaluee_first_name}} {{evaluee_last_name}}`,
      content: `Hi {{evaluator_first_name}},\n\nHope you're doing well. Quick update on your request to remove your {{template_display_name}} of {{evaluee_first_name}}  {{evaluee_last_name}} {{project_details}} from your list: after giving it a thorough look, we're unable to proceed with the removal at this time.\n\nWe totally get that evaluations are a bit like trying to fit a square peg in a round hole sometimes, but in this case, we still think your inputs on {{evaluee_first_name}}'s performance is very important. If there's any way we can make it more efficient or if you have further concerns, please let us know so we can assist you.\n\nThanks for your understanding, and let's keep the lines of communication open!\n\nBest Regards,\nKH360 Admin`,
    },
    {
      name: "Evaluation Completed 🎉",
      template_type: "Evaluation Complete Thank You Message",
      is_default: true,
      subject: "Evaluation Completed 🎉",
      content: `Thank you for completing the evaluation form! Your feedback is invaluable to us. 🌟`,
    },
    {
      name: "Evaluation Completed by Evaluator",
      template_type: "Evaluation Completed by Evaluator",
      is_default: true,
      subject: `Evaluation Completed by {{evaluator_last_name}}, {{evaluator_first_name}}`,
      content: `Dear KH360 Admin,\n\nPlease be informed that {{evaluator_last_name}}, {{evaluator_first_name}} has successfully completed the Evaluation Forms for {{evaluation_administration_name}} on {{submitted_date}}.\n\nThe completed evaluation forms are now available for your review. Kindly access the system to view and analyze the data at your convenience.\n\nThanks and Best Regards,\nKH360 Team`,
    },
    {
      name: "Evaluation Results Now Available",
      template_type: "Publish Evaluation Results",
      is_default: true,
      subject: "Performance Evaluation Results Now Available",
      content: `Hi {{evaluee_first_name}},\n\nI hope this message finds you well. We wanted to inform you that the results of your recent performance evaluation are now available for your review.\n\nTo access your evaluation, please click on this {{link}} or you can log in to KH360 and navigate to the "My Evaluations" section.\n\nWe encourage you to take the time to carefully review the feedback provided. This is an opportunity to reflect on your accomplishments and areas for improvement, and to discuss any questions or concerns you may have with your Career Manager during your upcoming performance review meeting.\n\nIf you encounter any technical difficulties or have questions regarding the content of your evaluation, please don't hesitate to reach out to our HR department at hr@nerubia.com.\n\nThank you for your hard work and dedication to the company. We value your contributions and look forward to supporting your continued success.\n\nCheers,\nKH360 Team`,
    },
    {
      name: "No Available Evaluation Results",
      template_type: "No Available Evaluation Results",
      is_default: true,
      subject: "",
      content: `Uh-oh! 🤷‍♂️\n\nLooks like our magical elves are still working their charm behind the scenes, and your results haven't arrived just yet. Don't worry, though – good things come to those who wait!\n\nIn the meantime, why not grab a cup of coffee or practice your superhero pose? 🦸‍♀️ We'll have those results ready for you in no time.\n\nStay tuned and keep the positive vibes flowing! ✨`,
    },
    {
      name: "No Pending Evaluation Forms",
      template_type: "No Pending Evaluation Forms",
      is_default: true,
      subject: "",
      content: `Howdy, Awesome User! 🌟\n\nGuess what? Our evaluation forms are currently on vacation, sipping virtual coconut water on a pixelated beach. 🏝️ So, no forms to fill up just yet. Your enthusiasm for productivity is unmatched!\n\nBut hey, if you're seeing this and you've completed all the forms already, give yourself a pat on the back! 🙌 You're officially the Form-Filling Maestro! 🎉\n\nWhile you wait for new forms to conquer, why not take a digital stroll, practice your dance moves or perfect the art of high-fiving yourself? 🕺🤚\n\nCheers to your patience and positive vibes! 🎉✨`,
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
    } else {
      await prisma.email_templates.update({
        where: {
          id: emailTemplate.id,
        },
        data,
      })
    }
  }
}

const createEmailRecipients = async () => {
  const emailRecipients = [
    {
      email_type: "KH360 Admin",
      email: "kh360admin@nerubia.com",
      status: true,
    },
  ]
  for (const data of emailRecipients) {
    const emailRecipient = await prisma.email_recipients.findFirst({
      where: {
        email_type: data.email_type,
      },
    })
    if (emailRecipient === null) {
      await prisma.email_recipients.create({
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
          rate: 0,
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

const createSystemSettings = async () => {
  const systemSettings = [
    {
      name: "default_timezone",
      value: "+08:00",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "default_timezone_country",
      value: "Singapore",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]
  for (const data of systemSettings) {
    const settings = await prisma.system_settings.findFirst({
      where: {
        name: data.name,
      },
    })
    if (settings === null) {
      await prisma.system_settings.create({
        data,
      })
    }
  }
}

async function main() {
  if (process.env.APP_ENV === Environment.Production) {
    await createRoles()
    await createEmailTemplates()
    await createEmailRecipients()
    await updateEvaluationTemplates()
    await createSystemSettings()
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
