import { type Decimal } from "@prisma/client/runtime/library"

export interface TaxType {
  id: number
  name: string | null
  rate: Decimal | null
}
