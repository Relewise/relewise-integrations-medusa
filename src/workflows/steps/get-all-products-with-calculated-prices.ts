import { createStep } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules, QueryContext } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/workflows-sdk"
import { RELEWISE_MODULE } from "../../modules/relewise"
import RelewiseService from "../../modules/relewise/service"

export const getAllProductsWithCalculatedPricesStep = createStep(
  "get-all-products-with-calculated-prices",
  async (_, { container }) => {

    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const relewiseService: RelewiseService = container.resolve(RELEWISE_MODULE);

    const results = await Promise.all(
      relewiseService.options.currencies.map((currency_code) =>
        query.graph({
          entity: "product",
          fields: [
            "id",
            "variants.calculated_price.currency_code",
            "variants.calculated_price.calculated_amount",
            "variants.calculated_price.original_amount",
          ],
          context: {
            variants: {
              calculated_price: QueryContext({
                currency_code,
              }),
            },
          },
        }) as Promise<{ data: QueryResultEntity[] }>
      )
    );

    const productsWithCalculatedVariantPrices = results.reduce<ProductVariantPrices>((temp, result) => {
      result.data.forEach(product => {
        if (!temp[product.id]) {
          temp[product.id] = {};
        }
        
        product.variants.forEach(variant => {
          if (!variant.calculated_price) 
            return;

          if (!temp[product.id][variant.id]) {
            temp[product.id][variant.id] = [];
          }
          
          temp[product.id][variant.id].push({
            currency_code: variant.calculated_price.currency_code,
            calculated_amount: variant.calculated_price.calculated_amount,
            original_amount: variant.calculated_price.original_amount
          });
        });
      });

      return temp;
    }, {});

    return new StepResponse(productsWithCalculatedVariantPrices)
  }
);

type QueryResultEntity = {
  id: string
  variants: Array<{
    id: string
    calculated_price: {
      currency_code: string
      calculated_amount: number
      original_amount: number
    }
  }>
}

export type ProductVariantPrices = Record<string, Record<string, {
      currency_code: string
      calculated_amount: number
      original_amount: number
    }[]>>