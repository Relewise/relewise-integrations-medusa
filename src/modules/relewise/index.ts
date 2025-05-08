import { Module } from "@medusajs/framework/utils"
import RelewiseService from "./service"

export const RELEWISE_MODULE = "relewise"

export default Module(RELEWISE_MODULE, {
  service: RelewiseService,
})