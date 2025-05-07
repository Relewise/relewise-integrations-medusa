import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import RelewiseService from "../../modules/relewise/service"
import { ProductDTO } from "@medusajs/framework/types"
import { RELEWISE_MODULE } from "../../modules/relewise"

export type SyncProductsStepInput = {
    products: ProductDTO[]
}
  
export const syncProductsStep = createStep("sync-products", async ({ products }: SyncProductsStepInput, { container }) => {
    const relewiseService: RelewiseService = container.resolve(RELEWISE_MODULE);

    await relewiseService.Sync(products);

    return new StepResponse();
  }
)