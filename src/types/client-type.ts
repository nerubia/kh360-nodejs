import { type Country } from "./country-type"

export interface Client {
  id: number
  name: string | null
  display_name?: string | null
  contact_first_name: string | null
  contact_last_name: string | null

  address1?: string | null
  address2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: number | null

  countries?: Country | null
}
