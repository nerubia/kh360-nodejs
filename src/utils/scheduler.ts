import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"
import { updateSurveyAdministrationsJob } from "../jobs/update-survey-administrations-job"
import { updateSkillMapAdministrationsJob } from "../jobs/update-skill-map-administrations-job"
import { sendEvaluationEmailJob } from "../jobs/send-evaluation-email-job"
import { sendSurveyEmailJob } from "../jobs/send-survey-email-job"
import { sendSkillMapEmailJob } from "../jobs/send-skill-map-email-job"

// 12am UTC - (8am SGT) 0 0 * * *
// (5 mins for now)
const everyDay = schedule.scheduleJob("*/1 * * * *", async () => {
  await updateEvaluationAdministrationsJob()
  await updateSurveyAdministrationsJob()
  await updateSkillMapAdministrationsJob()
})

// every hour 0 * * * *
// (5mins for now)
const everyHour = schedule.scheduleJob("* * * * * *", async () => {
  await sendEvaluationEmailJob()
  await sendSurveyEmailJob()
  await sendSkillMapEmailJob()
})

export default { everyDay, everyHour }
