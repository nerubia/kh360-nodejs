class CustomError extends Error {
  status: number
  constructor(message: string, status: number) {
    super()
    this.name = "CustomError"
    this.message = message
    this.status = status
  }
}

export default CustomError
