export interface User {
  id: number
  slug?: string
  email?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  is_active?: boolean
  roles?: string[]
  picture?: string
  role?: string
  company?: string
  is_external?: boolean
  totalSubmitted?: number
  totalEvaluations?: number
  projectRole?: string
}
