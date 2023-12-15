export interface ProjectMember {
  project_id?: number
  user_id?: number
  project_role_id?: number
  start_date?: Date | string
  end_date?: Date | string
  allocation_rate?: number
  remarks?: string
}
