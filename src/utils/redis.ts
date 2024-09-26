import { createClient } from "redis"
import logger from "./logger"

const redisClient = createClient()

redisClient.on("ready", () => {
  logger.info("Redis connected")
})

redisClient.on("error", (error) => {
  logger.error("Redis Error", error)
})

export const connectRedis = async () => {
  await redisClient.connect()
}

export const getCache = async (key: string) => {
  const data = await redisClient.get(key)
  return data !== null ? JSON.parse(data) : null
}

export const setCache = async <T>(key: string, value: T, ttl = 60) => {
  await redisClient.setEx(key, ttl, JSON.stringify(value))
}
