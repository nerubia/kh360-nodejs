import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"
import { sendEvaluationEmailJob } from "../jobs/send-evaluation-email-job"

// 12am UTC - (8am SGT)
// (5 mins for now)
const everyDay = schedule.scheduleJob("*/5 * * * *", async () => {
  await updateEvaluationAdministrationsJob()
})

// every hour 0 * * * *
// (10mins for now)
const everyHour = schedule.scheduleJob("*/10 * * * *", async () => {
  await sendEvaluationEmailJob()
})

export default { everyDay, everyHour }
