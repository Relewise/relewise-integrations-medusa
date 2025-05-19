import { PriceDTO, ProductVariantDTO } from "@medusajs/framework/types";

export type VariantWithPricesDTO = ProductVariantDTO & {
  prices: PriceDTO[];
};