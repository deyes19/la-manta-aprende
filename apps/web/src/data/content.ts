import data from "../content/pilot.json";
import { unitSchema } from "../../../../packages/content-schema";
export const pilot = unitSchema.parse(data);
export type { Step, Unit } from "../../../../packages/content-schema";
