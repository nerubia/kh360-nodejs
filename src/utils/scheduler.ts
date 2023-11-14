import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"

// 8am every day
const scheduledJobs = schedule.scheduleJob("0 8 * * *", async () => {
  await updateEvaluationAdministrationsJob()
})

export default scheduledJobs
