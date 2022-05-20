import { API, FileInfo } from "jscodeshift";
import cors from "./transform-cors";
import hookNaming from "./transform-hook-naming";
import hookSignature from "./transform-hook-signature";
import resourceCall from "./transform-resource-call";

const transforms = [cors, hookNaming, hookSignature, resourceCall];

export default function (fileInfo: FileInfo, api: API): string {
  let source = fileInfo.source;

  for (const fix of transforms) {
    source = fix({ ...fileInfo, source }, api);
  }

  return source;
}
