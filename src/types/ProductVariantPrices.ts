export type ProductVariantPrices = Record<string, Record<string, {
      currency_code: string
      calculated_amount: number
      original_amount: number
    }[]>>