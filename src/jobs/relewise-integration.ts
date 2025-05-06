import { MedusaContainer } from "@medusajs/framework/types"

export default async function greetingJob(container: MedusaContainer) {
  const logger = container.resolve("logger")

  logger.info("Integrating with Relewise")
}
export const config = {
  name: "Relewise Integration",
  schedule: "* * * * *",
}