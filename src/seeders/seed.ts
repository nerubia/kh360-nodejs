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

const createEvaluationAdministrations = async () => {
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
      name: "Update Evaluation Administration Template",
      template_type: "Create New Evaluation",
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
      content: `Dear {{evaluator_first_name}},\n\nI hope this email finds you well. We appreciate your valuable contribution to our performance evaluation process. However, it seems that your feedback is still pending for the following:\n\n{{evaluee_list}}\nCompleting the evaluation is crucial for fostering growth and continuous improvement within our team. Your insights are instrumental in shaping a well-rounded assessment.\n\nCould you please take a few moments to finalize and submit your performance evaluation? Your input is highly valued and plays a significant role in recognizing achievements and identifying areas for development. Please click on this {{link}} to access the evaluation forms. The deadline for completion is on {{evaluation_end_date}}. \n\nIf you have already completed the evaluation, please disregard this message, and we extend our heartfelt gratitude for your prompt response.\n\nThank you for your commitment to our shared success. If you encounter any issues or have questions, feel free to reach out to hr@nerubia.com.\n\nBest regards,\nKH360 Team`,
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
      content: `Thank you for completing the evaluation form!\n\nYour feedback is invaluable to us. 🌟`,
    },
    {
      name: "Evaluation Completed 🎉",
      template_type: "Evaluation Complete Thank You Message External",
      is_default: true,
      subject: "Evaluation Completed 🎉",
      content: `Thank you for completing the evaluation form!\n\nYour feedback is invaluable to us. 🌟`,
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

const updateProjectRoles = async () => {
  const names = [
    "Project Manager",
    "System Analyst",
    "Developer",
    "Quality Assurance",
    "Code Reviewer",
  ]
  for (const name of names) {
    const projectRole = await prisma.project_roles.findFirst({
      where: {
        name,
      },
    })
    if (projectRole !== null) {
      await prisma.project_roles.update({
        where: {
          id: projectRole.id,
        },
        data: {
          for_project: true,
        },
      })
    }
  }
}

const createScoreRatings = async () => {
  const scoreRatings = [
    {
      name: "Needs Improvement",
      display_name: "Navigational Challenge",
      min_score: 0,
      max_score: 1.99,
      result_description: `Employee faces occasional difficulty in navigating job responsibilities.\nPerformance consistently falls below expectations and significant improvement is needed in various aspects of job responsibilities.\nGoals and objectives are not met consistently.`,
      evaluee_description: `You face occasional difficulty in navigating job responsibilities.\nYour performance consistently falls below expectations and significant improvement is needed in various aspects of job responsibilities.\nYour goals and objectives are not met consistently.`,
    },
    {
      name: "Fair",
      display_name: "Needs a GPS",
      min_score: 2,
      max_score: 3.99,
      result_description: `Employee is on the right track but occasionally takes detours.\nPerformance meets some basic expectations but falls short in key areas.\nLike a GPS signal with occasional hiccups, improvement is required to meet all performance expectations.\nGoals and objectives are partially achieved occasionally taking the scenic route.`,
      evaluee_description: `You are on the right track but occasionally takes detours.\nYour performance meets some basic expectations but falls short in key areas.\nLike a GPS signal with occasional hiccups, improvement is required to meet all performance expectations.\nGoals and objectives are partially achieved occasionally taking the scenic route.`,
    },
    {
      name: "Satisfactory",
      display_name: "Smooth Sailing",
      min_score: 4,
      max_score: 5.99,
      result_description: `Employee navigates job responsibilities with ease, performing consistently and meeting the established expectations.\nLike a well-oiled machine, goals and objectives are typically reached.\nEmployee fulfills job responsibilities adequately.\nGoals and objectives are generally met.`,
      evaluee_description: `You navigate job responsibilities with ease, performing consistently and meeting the established expectations.\nLike a well-oiled machine, goals and objectives are typically reached.\nYou fulfill job responsibilities adequately.\nGoals and objectives are generally met.`,
    },
    {
      name: "Good",
      display_name: "Rocket Booster",
      min_score: 6,
      max_score: 7.99,
      result_description: `Employee's performance is out of this world, reaching new heights.\nLike a rocket with booster engines, employee demonstrates exceptional skills and achievements in various aspects of the job.\nGoals and objectives are consistently surpassed on a trajectory toward the stars.`,
      evaluee_description: `Your performance is out of this world, reaching new heights.\nLike a rocket with booster engines, you demonstrate exceptional skills and achievements in various aspects of the job.\nGoals and objectives are consistently surpassed on a trajectory toward the stars.`,
    },
    {
      name: "Excellent",
      display_name: "Unicorn Status",
      min_score: 8,
      max_score: 10,
      result_description: `Employee is as rare and magical as a unicorn, consistently exceeding expectations.\nLike finding a four-leaf clover, outstanding achievements are consistently realized.\nEmployee consistently demonstrates exceptional skills, innovation, and leadership.\nGoals and objectives are consistently exceeded with outstanding results.`,
      evaluee_description: `You are as rare and magical as a unicorn, consistently exceeding expectations.\nLike finding a four-leaf clover, outstanding achievements are consistently realized.\nYou consistently demonstrate exceptional skills, innovation, and leadership.\nGoals and objectives are consistently exceeded with outstanding results.`,
    },
  ]
  for (const data of scoreRatings) {
    const scoreRating = await prisma.score_ratings.findFirst({
      where: {
        name: data.name,
      },
    })
    if (scoreRating === null) {
      await prisma.score_ratings.create({
        data,
      })
    }
  }
}

const createSkillCategories = async () => {
  const skillCategories = [
    {
      name: "Programming Languages",
      sequence_no: 1,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "Development Frameworks",
      sequence_no: 2,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "Database",
      sequence_no: 3,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "Markup and Stylings",
      sequence_no: 4,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "API Integration",
      sequence_no: 5,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "Testing Frameworks",
      sequence_no: 6,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "DevOps and Workflows",
      sequence_no: 7,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "Other Technologies",
      sequence_no: 8,
      status: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]
  for (const data of skillCategories) {
    const skillCategory = await prisma.skill_categories.findFirst({
      where: {
        name: data.name,
      },
    })
    if (skillCategory === null) {
      await prisma.skill_categories.create({
        data,
      })
    }
  }
}

const createSkills = async () => {
  const currentDate = new Date()
  const skills = [
    { skill_category_id: 1, name: "Adobe Flex", sequence_no: 1, status: true },
    { skill_category_id: 1, name: "Action Script", sequence_no: 2, status: true },
    { skill_category_id: 1, name: "C#", sequence_no: 3, status: true },
    { skill_category_id: 1, name: "C++", sequence_no: 4, status: true },
    { skill_category_id: 1, name: "C", sequence_no: 5, status: true },
    { skill_category_id: 1, name: "Objective C", sequence_no: 6, status: true },
    { skill_category_id: 1, name: "Go", sequence_no: 7, status: true },
    { skill_category_id: 1, name: "Java (J2EE)", sequence_no: 8, status: true },
    { skill_category_id: 1, name: "Java (J2SE)", sequence_no: 9, status: true },
    { skill_category_id: 1, name: "JavaScript", sequence_no: 10, status: true },
    { skill_category_id: 1, name: "Kotlin", sequence_no: 11, status: true },
    { skill_category_id: 1, name: "Ruby", sequence_no: 12, status: true },
    { skill_category_id: 1, name: "SQL", sequence_no: 13, status: true },
    { skill_category_id: 1, name: "Swift", sequence_no: 14, status: true },
    { skill_category_id: 1, name: "Perl", sequence_no: 15, status: true },
    { skill_category_id: 1, name: "PHP", sequence_no: 16, status: true },
    { skill_category_id: 1, name: "Python", sequence_no: 17, status: true },
    { skill_category_id: 1, name: "Scala", sequence_no: 18, status: true },
    { skill_category_id: 1, name: "TypeScript", sequence_no: 19, status: true },
    { skill_category_id: 1, name: "VisualBasic.NET", sequence_no: 20, status: true },
    { skill_category_id: 2, name: "jQuery", sequence_no: 1, status: true },
    { skill_category_id: 2, name: "AngularJS", sequence_no: 2, status: true },
    { skill_category_id: 2, name: "Angular", sequence_no: 3, status: true },
    { skill_category_id: 2, name: "Ionic", sequence_no: 4, status: true },
    { skill_category_id: 2, name: "ReactJS", sequence_no: 5, status: true },
    { skill_category_id: 2, name: "React Native", sequence_no: 6, status: true },
    { skill_category_id: 2, name: "Redux", sequence_no: 7, status: true },
    { skill_category_id: 2, name: "Flux", sequence_no: 8, status: true },
    { skill_category_id: 2, name: "NodeJS", sequence_no: 9, status: true },
    { skill_category_id: 2, name: "ExpressJS", sequence_no: 10, status: true },
    { skill_category_id: 2, name: "HapiJS", sequence_no: 11, status: true },
    { skill_category_id: 2, name: "Koa2", sequence_no: 12, status: true },
    { skill_category_id: 2, name: "KrakenJS", sequence_no: 13, status: true },
    { skill_category_id: 2, name: "SailsJS", sequence_no: 14, status: true },
    { skill_category_id: 2, name: "VueJS", sequence_no: 15, status: true },
    { skill_category_id: 2, name: "Cake PHP", sequence_no: 16, status: true },
    { skill_category_id: 2, name: "Code Igniter", sequence_no: 17, status: true },
    { skill_category_id: 2, name: "Kohana", sequence_no: 18, status: true },
    { skill_category_id: 2, name: "Laravel", sequence_no: 19, status: true },
    { skill_category_id: 2, name: "PhalconPHP", sequence_no: 20, status: true },
    { skill_category_id: 2, name: "Symfony", sequence_no: 21, status: true },
    { skill_category_id: 2, name: "Yii 2", sequence_no: 22, status: true },
    { skill_category_id: 2, name: "Zend Framework", sequence_no: 23, status: true },
    { skill_category_id: 2, name: "Android", sequence_no: 24, status: true },
    { skill_category_id: 2, name: "JSF", sequence_no: 25, status: true },
    { skill_category_id: 2, name: "Spring Boot", sequence_no: 26, status: true },
    { skill_category_id: 2, name: "Spring MVC", sequence_no: 27, status: true },
    { skill_category_id: 2, name: "ASP.NET MVC5", sequence_no: 28, status: true },
    { skill_category_id: 2, name: "ASP.NET Entity Framework", sequence_no: 29, status: true },
    { skill_category_id: 2, name: ".NET", sequence_no: 30, status: true },
    { skill_category_id: 2, name: "Rails", sequence_no: 31, status: true },
    { skill_category_id: 2, name: "Play framework", sequence_no: 32, status: true },
    { skill_category_id: 2, name: "Drupal", sequence_no: 33, status: true },
    { skill_category_id: 2, name: "Joomla", sequence_no: 34, status: true },
    { skill_category_id: 2, name: "Magento", sequence_no: 35, status: true },
    { skill_category_id: 2, name: "Wordpress", sequence_no: 36, status: true },
    { skill_category_id: 2, name: "Beego", sequence_no: 37, status: true },
    { skill_category_id: 2, name: "Cordova", sequence_no: 38, status: true },
    { skill_category_id: 2, name: "Django", sequence_no: 39, status: true },
    { skill_category_id: 2, name: "Gorilla", sequence_no: 40, status: true },
    { skill_category_id: 2, name: "GoCraft", sequence_no: 41, status: true },
    { skill_category_id: 2, name: "GRails", sequence_no: 42, status: true },
    { skill_category_id: 2, name: "GWT", sequence_no: 43, status: true },
    { skill_category_id: 2, name: "Koala", sequence_no: 44, status: true },
    { skill_category_id: 2, name: "Martini", sequence_no: 45, status: true },
    { skill_category_id: 2, name: "Net/HTTP", sequence_no: 46, status: true },
    { skill_category_id: 2, name: "PhoneGap", sequence_no: 47, status: true },
    { skill_category_id: 2, name: "Sinatra", sequence_no: 48, status: true },
    { skill_category_id: 2, name: "Slim", sequence_no: 49, status: true },
    { skill_category_id: 2, name: "Struts", sequence_no: 50, status: true },
    { skill_category_id: 2, name: "TurboGears", sequence_no: 51, status: true },
    { skill_category_id: 2, name: "Unity", sequence_no: 52, status: true },
    { skill_category_id: 2, name: "web2py", sequence_no: 53, status: true },
    { skill_category_id: 2, name: "Xamarin", sequence_no: 54, status: true },
    { skill_category_id: 3, name: "Android Room", sequence_no: 1, status: true },
    { skill_category_id: 3, name: "Cassandra", sequence_no: 2, status: true },
    { skill_category_id: 3, name: "Foxpro", sequence_no: 3, status: true },
    { skill_category_id: 3, name: "MySQL", sequence_no: 4, status: true },
    { skill_category_id: 3, name: "MSSQL", sequence_no: 5, status: true },
    { skill_category_id: 3, name: "MongoDB", sequence_no: 6, status: true },
    { skill_category_id: 3, name: "Oracle", sequence_no: 7, status: true },
    { skill_category_id: 3, name: "Postgre", sequence_no: 8, status: true },
    { skill_category_id: 3, name: "SQLite", sequence_no: 9, status: true },
    { skill_category_id: 3, name: "Sybase", sequence_no: 10, status: true },
    { skill_category_id: 4, name: "XML", sequence_no: 1, status: true },
    { skill_category_id: 4, name: "HTML", sequence_no: 2, status: true },
    { skill_category_id: 4, name: "HTML5", sequence_no: 3, status: true },
    { skill_category_id: 4, name: "CSS", sequence_no: 4, status: true },
    { skill_category_id: 4, name: "Sass", sequence_no: 5, status: true },
    { skill_category_id: 4, name: "PostCSS", sequence_no: 6, status: true },
    { skill_category_id: 4, name: "Bootstrap", sequence_no: 7, status: true },
    { skill_category_id: 4, name: "Bulma", sequence_no: 8, status: true },
    { skill_category_id: 4, name: "Material", sequence_no: 9, status: true },
    { skill_category_id: 5, name: "Authorize.Net", sequence_no: 1, status: true },
    { skill_category_id: 5, name: "BrainTree", sequence_no: 2, status: true },
    { skill_category_id: 5, name: "Paypal", sequence_no: 3, status: true },
    { skill_category_id: 5, name: "Stripe", sequence_no: 4, status: true },
    { skill_category_id: 5, name: "WePay", sequence_no: 5, status: true },
    { skill_category_id: 5, name: "MailChimp / Mandrill API", sequence_no: 6, status: true },
    { skill_category_id: 5, name: "Send Grid", sequence_no: 7, status: true },
    { skill_category_id: 5, name: "Twilio", sequence_no: 8, status: true },
    { skill_category_id: 5, name: "Google oAuth2", sequence_no: 9, status: true },
    { skill_category_id: 5, name: "Facebook", sequence_no: 10, status: true },
    { skill_category_id: 5, name: "Twitter", sequence_no: 11, status: true },
    { skill_category_id: 5, name: "Firebase", sequence_no: 12, status: true },
    { skill_category_id: 5, name: "Google Maps", sequence_no: 13, status: true },
    { skill_category_id: 5, name: "GraphQL", sequence_no: 14, status: true },
    { skill_category_id: 5, name: "MakroKiosk", sequence_no: 15, status: true },
    { skill_category_id: 5, name: "Mixpanel", sequence_no: 16, status: true },
    { skill_category_id: 5, name: "Pinnacle API", sequence_no: 17, status: true },
    { skill_category_id: 6, name: "Chai", sequence_no: 1, status: true },
    { skill_category_id: 6, name: "Mocha", sequence_no: 2, status: true },
    { skill_category_id: 6, name: "Jasmine", sequence_no: 3, status: true },
    { skill_category_id: 6, name: "Karma", sequence_no: 4, status: true },
    { skill_category_id: 6, name: "Istanbul", sequence_no: 5, status: true },
    { skill_category_id: 6, name: "Selenium", sequence_no: 6, status: true },
    { skill_category_id: 6, name: "PHPUnit", sequence_no: 7, status: true },
    { skill_category_id: 6, name: "JUnit", sequence_no: 8, status: true },
    { skill_category_id: 6, name: "Jest", sequence_no: 9, status: true },
    { skill_category_id: 6, name: "WebDriver.IO", sequence_no: 10, status: true },
    { skill_category_id: 6, name: "RSpec", sequence_no: 11, status: true },
    { skill_category_id: 6, name: "Ava", sequence_no: 12, status: true },
    { skill_category_id: 6, name: "Katalon", sequence_no: 13, status: true },
    { skill_category_id: 8, name: "AJAX", sequence_no: 1, status: true },
    { skill_category_id: 8, name: "REST", sequence_no: 2, status: true },
    { skill_category_id: 8, name: "Socket.IO", sequence_no: 3, status: true },
    { skill_category_id: 8, name: "Babel", sequence_no: 4, status: true },
    { skill_category_id: 8, name: "Redis", sequence_no: 5, status: true },
    { skill_category_id: 8, name: "Kafka", sequence_no: 6, status: true },
    { skill_category_id: 8, name: "RabbitMQ", sequence_no: 7, status: true },
    { skill_category_id: 8, name: "ActiveMQ", sequence_no: 8, status: true },
    { skill_category_id: 8, name: "SQS", sequence_no: 9, status: true },
    { skill_category_id: 8, name: "Elastic Search", sequence_no: 10, status: true },
    { skill_category_id: 8, name: "God", sequence_no: 11, status: true },
    { skill_category_id: 8, name: "Sphinx", sequence_no: 12, status: true },
    { skill_category_id: 8, name: "Sidekiq", sequence_no: 13, status: true },
    { skill_category_id: 8, name: "Shopify", sequence_no: 14, status: true },
    { skill_category_id: 8, name: "WooCommerce", sequence_no: 15, status: true },
    { skill_category_id: 7, name: "Docker", sequence_no: 1, status: true },
    { skill_category_id: 7, name: "Codeship", sequence_no: 2, status: true },
    { skill_category_id: 7, name: "Kubernetes", sequence_no: 3, status: true },
    { skill_category_id: 7, name: "Jenkins", sequence_no: 4, status: true },
    { skill_category_id: 7, name: "CircleCI", sequence_no: 5, status: true },
    { skill_category_id: 7, name: "Apache", sequence_no: 6, status: true },
    { skill_category_id: 7, name: "Nodemon", sequence_no: 7, status: true },
    { skill_category_id: 7, name: "PM2", sequence_no: 8, status: true },
    { skill_category_id: 7, name: "Passenger", sequence_no: 9, status: true },
    { skill_category_id: 7, name: "Nginx", sequence_no: 10, status: true },
    { skill_category_id: 7, name: "Azure", sequence_no: 11, status: true },
    { skill_category_id: 7, name: "DNS", sequence_no: 12, status: true },
    { skill_category_id: 7, name: "CloudFlare", sequence_no: 13, status: true },
    { skill_category_id: 7, name: "CloudFront", sequence_no: 14, status: true },
    { skill_category_id: 7, name: "AWS Integration", sequence_no: 15, status: true },
    { skill_category_id: 7, name: "AWS CloudFormation", sequence_no: 16, status: true },
    { skill_category_id: 7, name: "AWS Lambda", sequence_no: 17, status: true },
    { skill_category_id: 7, name: "AWS EC2", sequence_no: 18, status: true },
    { skill_category_id: 7, name: "AWS CLI", sequence_no: 19, status: true },
  ]
  for (const data of skills) {
    const skill = await prisma.skills.findFirst({
      where: {
        name: data.name,
      },
    })
    if (skill === null) {
      await prisma.skills.create({
        data: {
          ...data,
          created_at: currentDate,
          updated_at: currentDate,
        },
      })
    }
  }
}

const updateAnswerOptionsAndSkillRatings = async () => {
  const answer = await prisma.answers.findFirst({
    where: {
      name: "Skill Map Scale",
    },
  })

  if (answer !== null) {
    const beginnerAnswerOption = await prisma.answer_options.findFirst({
      where: {
        answer_id: answer.id,
        name: "Beginner",
      },
    })

    const intermediateAnswerOption = await prisma.answer_options.findFirst({
      where: {
        answer_id: answer.id,
        name: "Intermediate",
      },
    })

    const expertAnswerOption = await prisma.answer_options.findFirst({
      where: {
        answer_id: answer.id,
        name: "Expert",
      },
    })

    if (
      beginnerAnswerOption !== null &&
      intermediateAnswerOption !== null &&
      expertAnswerOption !== null
    ) {
      // get beginner skill_map_ratings
      const beginnerSkillMapRatings = await prisma.skill_map_ratings.findMany({
        where: {
          answer_option_id: beginnerAnswerOption.id,
        },
      })

      const intermediateSkillMapRatings = await prisma.skill_map_ratings.findMany({
        where: {
          answer_option_id: intermediateAnswerOption.id,
        },
      })

      const expertSkillMapRatings = await prisma.skill_map_ratings.findMany({
        where: {
          answer_option_id: expertAnswerOption.id,
        },
      })

      // update old answer_options
      await prisma.answer_options.update({
        where: {
          id: beginnerAnswerOption.id,
        },
        data: {
          sequence_no: 1,
          name: "1",
          display_name: "1",
          rate: 1,
        },
      })

      await prisma.answer_options.update({
        where: {
          id: intermediateAnswerOption.id,
        },
        data: {
          sequence_no: 2,
          name: "2",
          display_name: "2",
          rate: 2,
        },
      })

      await prisma.answer_options.update({
        where: {
          id: expertAnswerOption.id,
        },
        data: {
          sequence_no: 3,
          name: "3",
          display_name: "3",
          rate: 3,
        },
      })

      // add more answer_options
      for (let s = 4; s <= 10; s++) {
        await prisma.answer_options.create({
          data: {
            answer_id: answer.id,
            sequence_no: s,
            name: s.toString(),
            display_name: s.toString(),
            rate: s,
          },
        })
      }

      const newBeginner = await prisma.answer_options.findFirst({
        where: {
          answer_id: answer.id,
          name: "2",
        },
      })

      const newIntermediate = await prisma.answer_options.findFirst({
        where: {
          answer_id: answer.id,
          name: "5",
        },
      })

      const newExpert = await prisma.answer_options.findFirst({
        where: {
          answer_id: answer.id,
          name: "8",
        },
      })

      if (newBeginner !== null && newIntermediate !== null && newExpert !== null) {
        await prisma.skill_map_ratings.updateMany({
          where: {
            id: {
              in: beginnerSkillMapRatings.map((skillMapRating) => skillMapRating.id),
            },
          },
          data: {
            answer_option_id: newBeginner.id,
          },
        })

        await prisma.skill_map_ratings.updateMany({
          where: {
            id: {
              in: intermediateSkillMapRatings.map((skillMapRating) => skillMapRating.id),
            },
          },
          data: {
            answer_option_id: newIntermediate.id,
          },
        })

        await prisma.skill_map_ratings.updateMany({
          where: {
            id: {
              in: expertSkillMapRatings.map((skillMapRating) => skillMapRating.id),
            },
          },
          data: {
            answer_option_id: newExpert.id,
          },
        })
      }
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
    await updateProjectRoles()
    await createScoreRatings()
    await createSkillCategories()
    await createSkills()
  }
  if (process.env.APP_ENV === Environment.Local) {
    await createUsers()
    await createEvaluationAdministrations()
    await createUserDetails()
    await createEvaluationResults()
  }
  await setAnswerTypes()
  await updateAnswerOptionsAndSkillRatings()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
