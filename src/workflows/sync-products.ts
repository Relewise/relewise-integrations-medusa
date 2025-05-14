import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getAllProductsStep } from "@medusajs/medusa/core-flows"
import { syncProductsStep } from "./steps/sync-products"

export const syncProductsWorkflow = createWorkflow({
    name: "relewise-sync-products",
    store: true, // Workflow runs will be stored in the redis only if the user has it running
    retentionTime: 172800, // 48 hours
    }, () => {
    const products = getAllProductsStep({
      select: ["id", "title"],
    });

    syncProductsStep({ products: products });

    return new WorkflowResponse({
      products: products,
    });
  }
)