import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"
import { sendEvaluationEmailJob } from "../jobs/send-evaluation-email-job"

// 12am UTC - (8am SGT)
const everyDay = schedule.scheduleJob("0 0 * * *", async () => {
  await updateEvaluationAdministrationsJob()
})

// every hour 0 * * * *
const everyHour = schedule.scheduleJob("0 * * * *", async () => {
  await sendEvaluationEmailJob()
})

export default { everyDay, everyHour }
