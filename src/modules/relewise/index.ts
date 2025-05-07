import { Module } from "@medusajs/framework/utils"
import RelewiseService from "./service"

// TODO: Check if this is actually needed!

export const RELEWISE_MODULE = "relewise"

export default Module(RELEWISE_MODULE, {
  service: RelewiseService,
})