import runTransforms from "../../helpers/run-transforms";
import removeEmptyRoutes from "./transform-remove-empty-routes";
import smartFields from "./transform-smart-fields";

export default runTransforms([removeEmptyRoutes, smartFields]);
