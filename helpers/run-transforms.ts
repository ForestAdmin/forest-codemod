import { API, FileInfo } from "jscodeshift";

type Transform = (file: FileInfo, api: API) => string;

export default function (transforms: Transform[]): Transform {
  return function (fileInfo: FileInfo, api: API): string {
    let source = fileInfo.source;

    for (const fix of transforms) {
      source = fix({ ...fileInfo, source }, api);
    }

    return source;
  };
}
