class CustomError extends Error {
  status: number
  data: unknown
  constructor(message: string, status: number, data?: unknown) {
    super()
    this.name = "CustomError"
    this.message = message
    this.status = status
    this.data = data
  }
}

export default CustomError
