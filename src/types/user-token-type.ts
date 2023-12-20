export interface UserToken {
  id: number
  email: string
  first_name: string
  last_name: string
  roles: string[]
  is_external: boolean
  user_details: {
    user_type: string
  }
}
