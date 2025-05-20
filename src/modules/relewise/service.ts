import { Logger } from "@medusajs/framework/types";
import { Integrator, ProductAdministrativeActionBuilder, ProductUpdateBuilder, ProductVariantBuilder } from "@relewise/integrations"
import { DataValueFactory, Trackable } from "@relewise/client"
import { ExtendedMedusaProduct } from "../../types/ProductWithVariantsAndPricesDTO";
import { ProductVariantPrices } from "../../workflows/steps/get-all-products-with-calculated-prices";

type RelewiseOptions = {
  datasetId: string;
  apiKey: string;
  serverUrl: string;
  language: string;
  currencies: string[];
}

type InjectedDependencies = {
  logger: Logger;
}

class RelewiseService {
  private integrator: Integrator;
  public options: RelewiseOptions;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies, options: RelewiseOptions) {
    if (!options.language) throw new Error("Relewise Plugin was not provided a language.")
    if (options.currencies.length === 0) throw new Error("Relewise Plugin was not provided any currencies.")

    this.integrator = new Integrator(options.datasetId, options.apiKey, { serverUrl: options.serverUrl })
    this.options = options;
    this.logger = logger;
  }

  async Sync(products: ExtendedMedusaProduct[], variantPrices: ProductVariantPrices) {
    const date: number = Date.now();

    const productUpdates: Trackable[] = [];
    
    products.forEach(product => {
      const variantWithLowestPriceInFirstCurrency = Object.entries(variantPrices[product.id])
        .map(([variantId, prices]) => ({
          variantId,
          price: prices.find(p => p.currency_code.toLowerCase() === this.options.currencies[0])
        }))
        .filter(v => v.price)
        .sort((a, b) => (a.price?.calculated_amount ?? 0) - (b.price?.calculated_amount ?? 0))[0]?.variantId;
        
      const productUpdate = new ProductUpdateBuilder({
        id: product.id,
        productUpdateKind: 'ReplaceProvidedProperties',
      })
      .salesPrice(variantPrices[product.id][variantWithLowestPriceInFirstCurrency]
        ?.map(price => ({ amount: price.calculated_amount, currency: price.currency_code })) ?? [])
      .listPrice(variantPrices[product.id][variantWithLowestPriceInFirstCurrency]
        ?.map(price => ({ amount: price.original_amount, currency: price.currency_code })) ?? [])
      .displayName([{ language: this.options.language, value: product.title }])
      .data({ 
        'ImportedAt': DataValueFactory.number(date),
        'Handle': DataValueFactory.string(product.handle),
        'Subtitle': product.subtitle
          ? DataValueFactory.multilingual([{ language: this.options.language, value: product.subtitle }])
          : null,
        'Description': product.description
          ? DataValueFactory.multilingual([{ language: this.options.language, value: product.description }])
          : null,
        'IsGiftcard': DataValueFactory.boolean(product.is_giftcard),
        'Status': DataValueFactory.string(product.status),
        'Thumbnail': product.thumbnail
          ? DataValueFactory.string(product.thumbnail)
          : null,
        'Weight': product.weight
          ? DataValueFactory.number(product.weight)
          : null,
        'Length': product.length
          ? DataValueFactory.number(product.length)
          : null,
        'Height': product.height
          ? DataValueFactory.number(product.height)
          : null,
        'Width': product.width
          ? DataValueFactory.number(product.width)
          : null,
        'OriginCountry': product.origin_country
          ? DataValueFactory.string(product.origin_country)
          : null,
        'HSCode': product.hs_code
          ? DataValueFactory.string(product.hs_code)
          : null,
        'MIDCode': product.mid_code
          ? DataValueFactory.string(product.mid_code)
          : null,
        'Material': product.material
          ? DataValueFactory.multilingual([{ language: this.options.language, value: product.material }])
          : null,
        'Discountable': DataValueFactory.boolean(product.discountable ?? false),
        'ExternalId': product.external_id
          ? DataValueFactory.string(product.external_id)
          : null,
        'Type': product.type
          ? DataValueFactory.object({ 
            'Id': DataValueFactory.string(product.type.id),
            'Value': DataValueFactory.string(product.type.value)
           })
          : null,
        'Collection': product.collection
          ? DataValueFactory.object({ 
            'Id': DataValueFactory.string(product.collection.id),
            'Title': DataValueFactory.string(product.collection.title),
            'Handle': DataValueFactory.string(product.collection.handle)
           })
          : null,
        'CreatedAt': DataValueFactory.string(typeof product.created_at === 'string' ? product.created_at : product.created_at.toISOString()),
        'UpdatedAt': DataValueFactory.string(new Date(product.updated_at).toISOString()),
        'SalesChannels': DataValueFactory.stringCollection(product.sales_channels.map(x => x.name)),
        'Images': DataValueFactory.stringCollection(product.images.map(x => x.url)),
        'OnSale': DataValueFactory.boolean(Object.entries(variantPrices[product.id]).some(x => x[1]
          .some(y => y.calculated_amount < y.original_amount)) ?? false),
      })
      .categoryPaths(b => {
        product.categories?.forEach(category => {
          b.path(p => p.category({ id: category.id, displayName: [{ language: this.options.language, value: category.name }]}))
        });
      })
      .variants(product.variants.map(variant => new ProductVariantBuilder({ id: variant.id })
        .displayName([{ language: this.options.language, value: variant.title }])
        .salesPrice(variantPrices[product.id][variant.id]
          ?.map(price => ({ amount: price.calculated_amount, currency: price.currency_code })) ?? [])
        .listPrice(variantPrices[product.id][variant.id]
          ?.map(price => ({ amount: price.original_amount, currency: price.currency_code })) ?? [])
        .data({
          'Sku': variant.sku
            ? DataValueFactory.string(variant.sku)
            : null,
          'AllowBackorder': DataValueFactory.boolean(variant.allow_backorder),
          'ManageInventory': DataValueFactory.boolean(variant.manage_inventory),
          'HSCode': variant.hs_code
            ? DataValueFactory.string(variant.hs_code)
            : null,
          'OriginCountry': variant.origin_country
            ? DataValueFactory.string(variant.origin_country)
            : null,
          'MIDCode': variant.mid_code
            ? DataValueFactory.string(variant.mid_code)
            : null,
          'Weight': variant.weight
            ? DataValueFactory.number(variant.weight)
            : null,
          'Length': variant.length
            ? DataValueFactory.number(variant.length)
            : null,
          'Height': variant.height
            ? DataValueFactory.number(variant.height)
            : null,
          'Width': variant.width
            ? DataValueFactory.number(variant.width)
            : null,
          'Material': variant.material
            ? DataValueFactory.multilingual([{ language: this.options.language, value: variant.material }])
            : null,
          'VariantRank': variant.variant_rank
            ? DataValueFactory.number(variant.variant_rank)
            : null,
          'EAN': variant.ean
            ? DataValueFactory.string(variant.ean)
            : null,
          'UPC': variant.upc
            ? DataValueFactory.string(variant.upc)
            : null,
          'Barcode': variant.barcode
            ? DataValueFactory.string(variant.barcode)
            : null,
          'OnSale': DataValueFactory.boolean(variantPrices[product.id][variant.id]?.map(x => x)
            .some(y => y.calculated_amount < y.original_amount) ?? false)
        })
        .build()));

      productUpdates.push(productUpdate.build());
    });

    this.logger.info(`Sending ${productUpdates.length} product updates to Relewise.`)

    const disableNonUpdatedProducts = new ProductAdministrativeActionBuilder({
      filters(filterBuilder) {
        filterBuilder
          .addProductDataFilter('ImportedAt', (conditionBuilder) => conditionBuilder.addEqualsCondition(DataValueFactory.number(date), true));
      },
      productUpdateKind: 'Disable',
    });
    
    productUpdates.push(disableNonUpdatedProducts.build());

    const enableUpdatedProducts = new ProductAdministrativeActionBuilder({
      filters(filterBuilder) {
        filterBuilder
          .addProductDataFilter('ImportedAt', (conditionBuilder) => conditionBuilder.addEqualsCondition(DataValueFactory.number(date)));
      },
      productUpdateKind: 'Enable',
    });
  
    productUpdates.push(enableUpdatedProducts.build());

    await this.integrator.batch(productUpdates);
  }
}

export default RelewiseService;