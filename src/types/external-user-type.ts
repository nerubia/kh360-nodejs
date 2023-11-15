export interface ExternalUser {
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  role?: string
  company?: string
  created_by_id?: number
  updated_by_id?: number
  created_at?: Date
  updated_at?: Date
}
