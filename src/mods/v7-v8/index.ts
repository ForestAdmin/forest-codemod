import runTransforms from "../../helpers/run-transforms";
import cors from "./transform-cors";
import hookNaming from "./transform-hook-naming";
import hookSignatureFields from "./transform-hook-signature-fields";
import resourceCall from "./transform-resource-call";
import hookSignatureRecord from "./transform-hook-signature-record";

export default runTransforms([
  cors,
  hookNaming,
  hookSignatureFields,
  hookSignatureRecord,
  resourceCall,
]);
