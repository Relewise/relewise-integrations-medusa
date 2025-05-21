import { MedusaContainer } from "@medusajs/framework/types"
import { syncProductsWorkflow } from "../workflows/sync-products";

export default async function relewiseIntegrationJob(container: MedusaContainer) {
  const logger = container.resolve("logger");
  
  logger.info("Relewise job started...");
  
  const workflow = await syncProductsWorkflow(container).run();
  
  logger.info(`Successfully synced ${workflow.result.products.data.length} products to Relewise`);
}

export const config = {
  name: "Relewise Integration",
  schedule: "0 * * * *", // Once every hour
}