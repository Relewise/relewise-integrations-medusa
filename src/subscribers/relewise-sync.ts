import {
    SubscriberArgs,
    type SubscriberConfig,
  } from "@medusajs/framework"
  import { syncProductsWorkflow } from "../workflows/sync-products"
  
  export default async function relewiseSyncHandler({ 
    container,
  }: SubscriberArgs) {
    const logger = container.resolve("logger");
    
    logger.info("Starting product indexing...");
  
    const workflow = await syncProductsWorkflow(container).run();
  
    logger.info(`Successfully synced ${workflow.result.products.data.length} products to Relewise`);
  }
  
  export const config: SubscriberConfig = {
    event: "relewise.sync",
  }