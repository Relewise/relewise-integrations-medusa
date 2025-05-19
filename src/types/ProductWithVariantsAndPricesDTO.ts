import { ProductDTO, SalesChannelDTO } from "@medusajs/framework/types";
import { VariantWithPricesDTO } from "./VariantWithPricesDTO";

export type ProductWithVariantsAndPricesDTO = ProductDTO & {
  variants: VariantWithPricesDTO[];
  SalesChannels: SalesChannelDTO[];
};