import { ScriptModel } from "crdt/node/load-script-models";
import { SingleExportVar } from "./parse-item-types";

export const generatePassPropAndLoop = (model: {
  exports: Record<string, SingleExportVar>;
}) => {
  let result = "";

  const vars: Record<string, string> = {};
  const pass_prop = {
    map: {
      value: "",
      item: "",
      idx: "",
    },
  };
  const loop = { name: "", array_type: "" };
  for (const e of Object.values(model.exports)) {
    if (e.type === "passprop") {
      if (e.name !== "key") {
        vars[e.name] = e.value;
        if (e.map) {
          pass_prop.map = e.map as any;
          if (e.name === e.map.item) {
            vars[e.name] = `(typeof pass_prop_list)[number]`;
          } else if (e.name === e.map.idx) {
            vars[e.name] = "number";
          }
        }
      }
    }
    if (e.type === "loop") {
      loop.name = e.name;
      loop.array_type = e.list;
    }
  }

  if (Object.values(vars).length > 0) {
    result = `
${
  pass_prop.map.value
    ? `export const pass_prop_list = ${pass_prop.map.value};`
    : ""
}
export const pass_prop = {
${Object.entries(vars)
  .map((e) => `${e[0]}: null as unknown as ${e[1]}`)
  .join(",\n")}
}
const PassProp: React.FC<{ key?: any; children: any } & typeof pass_prop & Record<string, any>> = null as any;`;
  }

  return result;
};
