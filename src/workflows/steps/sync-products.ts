import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import RelewiseService from "../../modules/relewise/service"
import { ProductDTO } from "@medusajs/framework/types"
import { RELEWISE_MODULE } from "../../modules/relewise"
import { ProductWithVariantsAndPricesDTO } from "../../types/ProductWithVariantsAndPricesDTO"

export type SyncProductsStepInput = {
    products: ProductWithVariantsAndPricesDTO[]
    variantPrices: any
}
  
export const syncProductsStep = createStep("sync-products", async ({ products, variantPrices }: SyncProductsStepInput, { container }) => {
    const relewiseService: RelewiseService = container.resolve(RELEWISE_MODULE);

    await relewiseService.Sync(products, variantPrices);

    return new StepResponse();
  }
)