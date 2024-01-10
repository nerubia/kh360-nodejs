export interface Project {
  name?: string | null
  client_id?: number | null
  start_date?: Date | string | null
  end_date?: Date | string | null
  status?: string | null
  description?: string | null
}

export enum ProjectStatus {
  Ongoing = "Ongoing",
  Closed = "Closed",
}
