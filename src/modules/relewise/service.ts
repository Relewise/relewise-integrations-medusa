import { MedusaContainer } from "@medusajs/framework"
import { ProductDTO } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

class RelewiseService {
    private container: MedusaContainer

    constructor(container: MedusaContainer) {
      this.container = container
    }
  
    async Sync(products: ProductDTO[]) {
        const logger = this.container.resolve("logger");
        
        logger.info(JSON.stringify(products, null, 2));
    }
}

export default RelewiseService;