import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getAllProductsStep } from "@medusajs/medusa/core-flows"
import { syncProductsStep, SyncProductsStepInput } from "./steps/sync-products"

export const syncProductsWorkflow = createWorkflow("sync-products", () => {
    const products = getAllProductsStep({
      select: ["id", "title"],
    });

    syncProductsStep({
      products: products,
    } as SyncProductsStepInput);

    return new WorkflowResponse({
      products: products
    });
  }
)