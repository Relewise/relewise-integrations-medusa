import { ProductDTO, SalesChannelDTO } from "@medusajs/framework/types";

export type ExtendedMedusaProduct = ProductDTO & {
  sales_channels: SalesChannelDTO[];
};