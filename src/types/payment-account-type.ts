export interface PaymentAccount {
  account_name: string | null
  account_type: string | null
  account_no: string | null
  bank_name: string | null
  bank_branch: string | null
  swift_code: string | null
}

export interface PaymentAccountFilters {
  payment_account_name?: string
  payment_network?: string
  account_name?: string
  account_no?: string
  bank_name?: string
  page?: string
}
