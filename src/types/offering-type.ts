export interface Offering {
  name: string
  client_id: number
  offering_category_id: number
  currency_id: number
  price: number
  description: string
  is_active: boolean
}

export interface OfferingFilters {
  name: string
  category_id: number
  client_id: number
  global: boolean
  is_active: string
  page: string
  orderBy?: OfferingOrderBy[]
}

export interface OfferingOrderBy {
  name?: SortOrder
  created_at?: SortOrder
}

type SortOrder = "asc" | "desc"
