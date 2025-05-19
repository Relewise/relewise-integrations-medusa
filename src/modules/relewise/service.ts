import { Logger, ProductDTO } from "@medusajs/framework/types";
import { Integrator, ProductAdministrativeActionBuilder, ProductUpdateBuilder, ProductVariantBuilder } from "@relewise/integrations"
import { DataValueFactory, Trackable } from "@relewise/client"
import { ProductWithVariantsAndPricesDTO } from "../../types/ProductWithVariantsAndPricesDTO";
import { VariantWithPricesDTO } from "../../types/VariantWithPricesDTO";

type RelewiseOptions = {
  datasetId: string;
  apiKey: string;
  serverUrl: string;
  language: string;
}

type InjectedDependencies = {
  logger: Logger;
}

class RelewiseService {
  private integrator: Integrator;
  private options: RelewiseOptions;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies, options: RelewiseOptions) {
    if (!options.language) throw new Error("Relewise Plugin was not provided a language.")

    this.integrator = new Integrator(options.datasetId, options.apiKey, { serverUrl: options.serverUrl })
    this.options = options;
    this.logger = logger;
  }

  async Sync(products: ProductWithVariantsAndPricesDTO[], variantPrices: any) {
    this.logger.info("Medusa Products: " + JSON.stringify(products, null, 2));
    this.logger.info("Medusa variantPrices: " + JSON.stringify(variantPrices, null, 2));
    const date: number = Date.now();

    const productUpdates: Trackable[] = [];
    
    products.forEach(product => {
      const productUpdate = new ProductUpdateBuilder({
        id: product.id,
        productUpdateKind: 'ReplaceProvidedProperties',
      })
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
      })
      .variants(product.variants?.map(variant => new ProductVariantBuilder({ id: variant.id })
        .displayName([{ language: this.options.language, value: variant.title }])
        .salesPrice((variant as VariantWithPricesDTO).prices?.map(price => ({ amount: price.amount as number, currency: price.currency_code ?? "" })))
        .listPrice((variant as VariantWithPricesDTO).prices?.map(price => ({ amount: price.amount as number, currency: price.currency_code ?? "" })))
        .build()));

      productUpdates.push(productUpdate.build());
    });

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

    // this.logger.info("Medusa Products: " + JSON.stringify(productUpdates, null, 2));

    await this.integrator.batch(productUpdates);
  }
}

export default RelewiseService;