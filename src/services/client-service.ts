import * as ClientRepository from "../repositories/client-repository"
import { getCache, setCache } from "../utils/redis"

export const getActiveClients = async () => {
  const KEY = "CLIENTS"

  let results = await getCache(KEY)

  if (results === null) {
    results = await ClientRepository.getAllByFilters({
      status: "Active",
    })

    await setCache(KEY, results)
  }

  return results
}
