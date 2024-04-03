export interface ExternalUser {
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  user_type: string
  role?: string
  company?: string
  access_token?: string
  code?: string
  failed_attempts?: number
  created_by_id?: number
  updated_by_id?: number
  created_at?: Date
  updated_at?: Date
}
