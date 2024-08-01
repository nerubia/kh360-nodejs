import axios, { AxiosError, type AxiosInstance } from "axios"
import { type Request, type Response } from "express"

export const executeTest = async (req: Request, res: Response) => {
  try {
    const { baseUrl, apiKey, http_method, payload } = req.body

    const customAxios = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Api-Key": apiKey,
      },
      withCredentials: true,
    })

    const response = await makeRequest(customAxios, http_method, payload)

    res.json(response.data)
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response !== undefined) {
        const status = error.response.status
        if (status === 400) {
          return res.status(status).json({
            message: "Invalid request",
          })
        }
        if (status === 401) {
          return res.status(status).json({
            message: "Unauthorized",
          })
        }
      }
    }
    res.status(500).json({ message: "Something went wrong" })
  }
}

const makeRequest = async (customAxios: AxiosInstance, http_method: string, payload: unknown) => {
  switch (http_method) {
    case "get":
      return await customAxios.get("")
    case "post":
      return await customAxios.post("", payload)
  }
  throw Error("Unknown request")
}
