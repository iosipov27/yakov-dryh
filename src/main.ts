import { createSystemApi } from "./module/api.js";
import { registerSystem } from "./module/system-registration/index.js";

const systemApi = createSystemApi();

registerSystem(systemApi);
