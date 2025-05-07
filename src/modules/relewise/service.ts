import { ProductDTO } from "@medusajs/framework/types";
import { Integrator, ProductAdministrativeActionBuilder, ProductUpdateBuilder } from "@relewise/integrations"
import { DataValueFactory, Trackable } from "@relewise/client"

type RelewiseOptions = {
  datasetId: string;
  apiKey: string;
  serverUrl: string;
  language: string | null;
}

class RelewiseService {
  private integrator: Integrator;
  private options: RelewiseOptions;

  constructor({}, options: RelewiseOptions) {
    this.integrator = new Integrator(options.datasetId, options.apiKey, { serverUrl: options.serverUrl })
    this.options = options;
  }

  async Sync(products: ProductDTO[]) {
    const date: number = Date.now();

    const productUpdates: Trackable[] = [];
    
    products.forEach(product => {
      const productUpdate = new ProductUpdateBuilder({
        id: product.id,
        productUpdateKind: 'ReplaceProvidedProperties',
      })
      .displayName([{ language: this.options.language ?? "en", value: product.title }])
      .data({ 'ImportedAt': DataValueFactory.number(date) });

      productUpdates.push(productUpdate.build());
    });

    const disableNonUpdatedProducts = new ProductAdministrativeActionBuilder({
      language: null,
      currency: null,
      filters(filterBuilder) {
          filterBuilder
              .addProductDataFilter(
                  'ImportedAt',
                  (conditionBuilder) => conditionBuilder.addEqualsCondition(
                      DataValueFactory.number(date), true),
                  true,
              );
      },
      productUpdateKind: 'Disable',
    });
    
    productUpdates.push(disableNonUpdatedProducts.build());

    const enableUpdatedProducts = new ProductAdministrativeActionBuilder({
      language: null,
      currency: null,
      filters(filterBuilder) {
          filterBuilder
              .addProductDataFilter(
                  'ImportedAt',
                  (conditionBuilder) => conditionBuilder.addEqualsCondition(
                      DataValueFactory.number(date), false),
              );
      },
      productUpdateKind: 'Enable',
    });
  
    productUpdates.push(enableUpdatedProducts.build());

    await this.integrator.batch(productUpdates);
  }
}

export default RelewiseService;