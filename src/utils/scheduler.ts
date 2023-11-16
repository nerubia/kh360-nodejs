import schedule from "node-schedule"
import { updateEvaluationAdministrationsJob } from "../jobs/update-evaluation-administrations-job"

// 12am UTC - (8am SGT)
const scheduledJobs = schedule.scheduleJob("0 0 * * *", async () => {
  await updateEvaluationAdministrationsJob()
})

export default scheduledJobs
