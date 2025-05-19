import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { ExtendedMedusaProduct } from "../types/ProductWithVariantsAndPricesDTO";
import { QueryContext } from "@medusajs/framework/utils";
import { getAllProductsWithCalculatedPricesStep } from "./steps/get-all-products-with-calculated-prices";
import { syncProductsStep } from "./steps/sync-products";

export const syncProductsWorkflow = createWorkflow({
    name: "relewise-sync-products",
    store: true, // Workflow runs will be stored in the redis only if the user has it running
    retentionTime: 172800, // 48 hours
    }, () => {
      const products = useQueryGraphStep({
          entity: "product",
          fields: [
            "*",
            "sales_channels.*",
            "variants.*",
            "variants.prices.*",
            "variants.calculated_price.*",
            "variants.inventory_items.*",
            "images.*",
          ],
          context: {
            variants: {
              calculated_price: QueryContext({
                currency_code: "eur",
              }),
            },
          },
        }) as { data: ExtendedMedusaProduct[] };
        
      const variantPrices = getAllProductsWithCalculatedPricesStep();

      syncProductsStep({ products: products.data, variantPrices: variantPrices });

      return new WorkflowResponse({
        products: products,
        variantPrices: variantPrices
      });
  }
)