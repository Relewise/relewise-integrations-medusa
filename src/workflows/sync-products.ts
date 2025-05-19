import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getAllProductsStep, getVariantPriceSetsStep, useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { syncProductsStep } from "./steps/sync-products"
import { ProductWithVariantsAndPricesDTO } from "../types/ProductWithVariantsAndPricesDTO";
import { QueryContext } from "@medusajs/framework/utils";

export const syncProductsWorkflow = createWorkflow("sync-products", () => {
    // const products = getAllProductsStep({
    //   select: [
    //     "*",
    //     "categories.*",
    //     "images.*",
    //     "tags.*",
    //     "variants.*",
    //     "variants.options*",
    //     "variants.prices*",
    //     "options.*",
    //     "collection.*",
    //     "type.*"
    //   ],
    // });
    
    const productsQuery = useQueryGraphStep({
      entity: "product",
      fields: [
        "*",
        "sales_channels.*",
        "variants.*",
        "variants.prices.*",
        "variants.calculated_price.*",
      ],
      context: {
        variants: {
          calculated_price: QueryContext({
            currency_code: "eur",
          }),
        },
      },
    }) as { data: ProductWithVariantsAndPricesDTO[] }

    const  variantPrices  = getVariantPriceSetsStep({
      variantIds: productsQuery.data.flatMap(product =>
      product.variants.map(variant => variant.id)
    )
    })

    syncProductsStep({ products: productsQuery.data, variantPrices: variantPrices });

    return new WorkflowResponse({
      products: productsQuery.data,
    });
  }
)