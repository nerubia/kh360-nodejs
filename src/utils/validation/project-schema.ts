import { object, string, array } from "yup"

export const createProjectSchema = object().shape({
  name: string().required("Name is required."),
  client_id: string(),
  start_date: string()
    .test("start-date", "Start date must not be later than end date.", function (start_date) {
      const end_date = this.parent.end_date
      if (start_date !== undefined && end_date !== undefined) {
        return new Date(start_date ?? "") <= new Date(end_date)
      } else {
        return true
      }
    })
    .test(
      "start-date",
      "Must select a date that is within the valid range.",
      function (start_date) {
        const currentDate = new Date()

        const maxDate = new Date(
          currentDate.getFullYear() + 50,
          currentDate.getMonth(),
          currentDate.getDate()
        )

        const minDate = new Date(
          currentDate.getFullYear() - 50,
          currentDate.getMonth(),
          currentDate.getDate()
        )

        if (start_date !== undefined) {
          return (
            new Date(start_date ?? "") <= new Date(maxDate) &&
            new Date(minDate) <= new Date(start_date ?? "")
          )
        } else {
          return true
        }
      }
    ),
  end_date: string()
    .test("end-date", "End period must not be earlier than start date.", function (end_date) {
      const start_date = this.parent.start_date
      if (end_date !== undefined) {
        return new Date(end_date ?? "") >= new Date(start_date)
      } else {
        return true
      }
    })
    .test("end-date", "Must select a date that is within the valid range.", function (end_date) {
      const currentDate = new Date()

      const maxDate = new Date(
        currentDate.getFullYear() + 50,
        currentDate.getMonth(),
        currentDate.getDate()
      )

      const minDate = new Date(
        currentDate.getFullYear() - 50,
        currentDate.getMonth(),
        currentDate.getDate()
      )

      if (end_date !== undefined) {
        return (
          new Date(end_date ?? "") <= new Date(maxDate) &&
          new Date(minDate) <= new Date(end_date ?? "")
        )
      } else {
        return true
      }
    }),
  description: string().nullable(),
  status: string().required("Status is required."),
  skill_ids: array(),
})
