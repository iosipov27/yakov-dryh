export class YakovDryhActor extends Actor {}

declare module "fvtt-types/configuration" {
  interface DocumentClassConfig {
    Actor: typeof YakovDryhActor;
  }
}
