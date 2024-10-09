import schedule from "node-schedule"
import { sendEvaluationEmailJob } from "../jobs/send-evaluation-email-job"
import { sendSkillMapEmailJob } from "../jobs/send-skill-map-email-job"
import { sendSurveyEmailJob } from "../jobs/send-survey-email-job"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"
import { updateInvoiceJob } from "../jobs/update-invoice-job"
import { updateSkillMapAdministrationsJob } from "../jobs/update-skill-map-administrations-job"
import { updateSurveyAdministrationsJob } from "../jobs/update-survey-administrations-job"

const everyDaySchedule =
  typeof process.env.EVERY_DAY_SCHEDULE === "string" ? process.env.EVERY_DAY_SCHEDULE : "0 0 * * *"
const everyHourSchedule =
  typeof process.env.EVERY_HOUR_SCHEDULE === "string"
    ? process.env.EVERY_HOUR_SCHEDULE
    : "*/5 * * * *"

// 12am UTC - (8am SGT) 0 0 * * *
// (5 mins for now)
const everyDayJob = schedule.scheduleJob(everyDaySchedule, async () => {
  await updateEvaluationAdministrationsJob()
  await updateSurveyAdministrationsJob()
  await updateSkillMapAdministrationsJob()
  await updateInvoiceJob()
})

// every hour 0 * * * *
// (5mins for now)
const everyHourJob = schedule.scheduleJob(everyHourSchedule, async () => {
  await sendEvaluationEmailJob()
  await sendSurveyEmailJob()
  await sendSkillMapEmailJob()
})

export default { everyDayJob, everyHourJob }
