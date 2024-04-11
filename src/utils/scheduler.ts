import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"
import { updateSurveyAdministrationsJob } from "../jobs/update-survey-administrations-job"
import { sendEvaluationEmailJob } from "../jobs/send-evaluation-email-job"
import { sendSurveyEmailJob } from "../jobs/send-survey-email-job"

// 12am UTC - (8am SGT)
// (5 mins for now)
const everyDay = schedule.scheduleJob("*/10 * * * *", async () => {
  await updateEvaluationAdministrationsJob()
  await updateSurveyAdministrationsJob()
})

// every hour 0 * * * *
// (5mins for now)
const everyHour = schedule.scheduleJob("*/5 * * * *", async () => {
  await sendEvaluationEmailJob()
  await sendSurveyEmailJob()
})

export default { everyDay, everyHour }
