import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import RelewiseService from "../../modules/relewise/service"
import { ProductDTO } from "@medusajs/framework/types"

export type SyncProductsStepInput = {
    products: ProductDTO[]
}
  

export const syncProductsStep = createStep("sync-products", async ({ products }: SyncProductsStepInput, { container }) => {
    const relewiseService: RelewiseService = new RelewiseService(container);

    await relewiseService.Sync(products);

    return new StepResponse(undefined, {products});
  }
)