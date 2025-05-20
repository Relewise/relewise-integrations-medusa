import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import RelewiseService from "../../modules/relewise/service"
import { RELEWISE_MODULE } from "../../modules/relewise"
import { ExtendedMedusaProduct } from "../../types/ProductWithVariantsAndPricesDTO"
import { ProductVariantPrices } from "../../types/ProductVariantPrices"

export type SyncProductsStepInput = {
    products: ExtendedMedusaProduct[]
    variantPrices: ProductVariantPrices
}
  
export const syncProductsStep = createStep({ name: "sync-products", async: true }, async ({ products, variantPrices }: SyncProductsStepInput, { container }) => {
    const relewiseService: RelewiseService = container.resolve(RELEWISE_MODULE);

    await relewiseService.Sync(products, variantPrices);

    return new StepResponse();
  }
)