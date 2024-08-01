export interface TestItem {
  apiId: number
  http_method: string
  payload: string
  response: string
  description?: string
  status: boolean
}
