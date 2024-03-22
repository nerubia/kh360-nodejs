import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"
import { updateSurveyAdministrationsJob } from "../jobs/update-survey-administrations-job"
import { sendEvaluationEmailJob } from "../jobs/send-evaluation-email-job"
import { sendSurveyEmailJob } from "../jobs/send-survey-email-job"

// 12am UTC - (8am SGT)
const everyDay = schedule.scheduleJob("0 0 * * *", async () => {
  await updateEvaluationAdministrationsJob()
  await updateSurveyAdministrationsJob()
})

// every hour 0 * * * *
const everyHour = schedule.scheduleJob("0 * * * *", async () => {
  await sendEvaluationEmailJob()
  await sendSurveyEmailJob()
})

export default { everyDay, everyHour }
