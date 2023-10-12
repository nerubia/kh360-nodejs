import { object, string } from "yup"

export const createEvaluationSchema = object().shape({
  name: string().required("Name is required"),
  eval_period_start_date: string().required("Start period is required"),
  eval_period_end_date: string().required("End period is required"),
  eval_schedule_start_date: string().required("Start schedule is required"),
  eval_schedule_end_date: string().required("End schedule is required"),
  remarks: string().required("Description is required"),
})
