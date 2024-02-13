import { number, object, string } from "yup"

export const createProjectSchema = object().shape({
  name: string().required("Name is required"),
  client_id: number().optional(),
  start_date: string().test(
    "start_date",
    "Start date must be before end date",
    function (start_date) {
      const end_date = this.parent.end_date
      return new Date(start_date ?? "") <= new Date(end_date)
    }
  ),
  end_date: string(),
  description: string().required("Description is required"),
  status: string().required("Status is required"),
})
