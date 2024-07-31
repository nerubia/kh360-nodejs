export interface TestItem {
  apiId: number
  httpMethod: string
  payload: string
  response: string
  description?: string
  status: boolean
}
