export interface Contract {
  id: number
  contract_no: string
  description: string
}

export enum ContractStatus {
  ACTIVE = "Active",
  DRAFT = "Draft",
  NO_GO = "No Go",
  FOR_CLIENT_APPROVAL = "For Client Approval",
  CANCELLED = "Cancelled",
}
