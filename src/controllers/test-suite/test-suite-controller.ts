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
            status,
          })
        }
        if (status === 401) {
          return res.status(status).json({
            message: "Unauthorized",
            status,
          })
        }
        if (status === 403) {
          return res.status(status).json({
            message: "Forbidden",
            status,
          })
        }
        if (status === 404) {
          return res.status(status).json({
            message: "Not found",
            status,
          })
        }
        if (status === 500) {
          return res.status(status).json({
            message: "API server error",
            status,
          })
        }
        return res.status(status).json({
          message: "Something went wrong",
          status,
        })
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
    case "put":
      return await customAxios.put("", payload)
    case "patch":
      return await customAxios.patch("", payload)
    case "delete":
      return await customAxios.delete("")
  }
  throw Error("Unknown request")
}
