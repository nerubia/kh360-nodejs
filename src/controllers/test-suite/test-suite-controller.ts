import axios, { type AxiosInstance } from "axios"
import { type Request, type Response } from "express"

export const executeTest = async (req: Request, res: Response) => {
  try {
    const { baseUrl, apiKey, httpMethod, payload } = req.body

    const customAxios = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Api-Key": apiKey,
      },
      withCredentials: true,
    })

    const response = await makeRequest(customAxios, httpMethod, payload)

    res.json(response.data)
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

const makeRequest = async (customAxios: AxiosInstance, httpMethod: string, payload: unknown) => {
  switch (httpMethod) {
    case "get":
      return await customAxios.get("")
    case "post":
      return await customAxios.post("", payload)
  }
  throw Error("Unknown request")
}
