export interface PaymentAccount {
  name?: string | null
  currency_id?: number | null
  payment_network_id?: number | null
  account_name: string | null
  account_type?: string | null
  account_no: string | null
  bank_name: string | null
  bank_branch?: string | null
  bank_code?: string | null
  swift_code?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  state?: string | null
  description?: string | null
  country_id?: number | null
  postal_code?: string | null
  is_active?: boolean | null
}

export interface PaymentAccountFilters {
  payment_account_name: string
  payment_network_id: number
  account_name: string
  account_no: string
  bank_name: string
  is_active: string
  page?: string
}
