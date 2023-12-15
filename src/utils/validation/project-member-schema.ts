import { number, object, string } from "yup"

export const createProjectMemberSchema = object().shape({
  project_id: number().required("Project id is required"),
  user_id: number().required("User id is required"),
  project_role_id: number().required("Project role id is required"),
  start_date: string().required("Start date is required"),
  end_date: string().required("End date is required"),
  allocation_rate: number().required("Allocation rate is required"),
  remarks: string().required("Remarks is required"),
})
