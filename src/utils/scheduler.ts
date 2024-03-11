import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"
import { updateSurveyAdministrationsJob } from "../jobs/update-survey-administrations-job"
import { updateSkillMapAdministrationsJob } from "../jobs/update-skill-map-administrations-job"
import { sendEvaluationEmailJob } from "../jobs/send-evaluation-email-job"
import { sendSurveyEmailJob } from "../jobs/send-survey-email-job"
import { sendSkillMapEmailJob } from "../jobs/send-skill-map-email-job"

// 12am UTC - (8am SGT)
const everyDay = schedule.scheduleJob("0 0 * * *", async () => {
  await updateEvaluationAdministrationsJob()
  await updateSurveyAdministrationsJob()
  await updateSkillMapAdministrationsJob()
})

// every hour 0 * * * *
const everyHour = schedule.scheduleJob("0 * * * *", async () => {
  await sendEvaluationEmailJob()
  await sendSurveyEmailJob()
  await sendSkillMapEmailJob()
})

export default { everyDay, everyHour }
