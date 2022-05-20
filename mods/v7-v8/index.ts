import { API, FileInfo } from "jscodeshift";
import cors from "./transform-cors";
import hookNaming from "./transform-hook-naming";
import hookSignatureFields from "./transform-hook-signature-fields";
import resourceCall from "./transform-resource-call";
import hookSignatureRecord from './transform-hook-signature-record';

const transforms = [cors, hookNaming, hookSignatureFields, resourceCall, hookSignatureRecord];

export default function (fileInfo: FileInfo, api: API): string {
  let source = fileInfo.source;

  for (const fix of transforms) {
    source = fix({ ...fileInfo, source }, api);
  }

  return source;
}
