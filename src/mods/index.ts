import runTransforms from "../helpers/run-transforms";
import versionSixToSeven from "./v6-v7";
import versionSevenToEight from "./v7-v8";
import versionEightToNewAgent from "./v8-new-agent";

export default runTransforms([versionSevenToEight]);
