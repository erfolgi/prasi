import { active } from "logic/active";
import { EComp } from "logic/types";
import { monacoCreateModel } from "popup/script/code/js/create-model";
import { migrateCode } from "popup/script/code/js/migrate-code";
import { parseItemCode } from "popup/script/code/js/parse-item-code";
import { SingleExportVar } from "popup/script/code/js/parse-item-types";
import { waitUntil } from "prasi-utils";
import { deepClone } from "utils/react/use-global";
import { jscript } from "utils/script/jscript";
import { IItem } from "utils/types/item";
import { loopItem } from "./loop-item";
import { rapidhash_fast as hash } from "./rapidhash";
import { TreeVarItems } from "./var-items";
import { ViRef } from "vi/lib/store";

const source_sym = Symbol("source");

export type ScriptModel = {
  source: string;
  source_hash: string;
  name: string;
  id: string;
  path_names: string[];
  prop_name?: string;
  prop_value?: string;
  path_ids: string[];
  comp_def?: EComp;
  title: string;
  local: { name: string; value: string; auto_render: boolean };
  loop: { name: string; list: string };
  extracted_content: string;
  model?: ReturnType<typeof monacoCreateModel> & { _ignoreChanges?: any };
  [source_sym]: string;
  ready: boolean;
  exports: Record<string, SingleExportVar>;
};

export const loadScriptModels = async (
  p: {
    comp: { loaded: Record<string, EComp>; pending: Set<string> };
    viref: ViRef;
    
  },
  items: IItem[],
  result: Record<string, ScriptModel>,
  var_items: TreeVarItems,
  comp_id?: string
) => {
  if (!jscript.loaded) {
    await waitUntil(() => jscript.loaded);
  }

  await loopItem(
    items,
    { active_comp_id: active.comp_id, comps: p.comp.loaded },
    async ({ item, path_name, path_id }) => {
      if (item.component?.id) {
        const comp_id = item.component.id;
        const comp_def = p.comp.loaded[comp_id];
        const props = comp_def?.content_tree?.component?.props || {};

        for (const [name, master_prop] of Object.entries(props)) {
          let prop = item.component.props?.[name];

          if (name.endsWith("__")) continue;
          const file = `${item.id}~${name}`;

          if (!prop && master_prop.meta?.type !== "content-element") {
            prop = {
              value: master_prop.value,
              valueBuilt: master_prop.valueBuilt,
            };
          }
          let prop_value = prop.value || "";
          if (master_prop.meta?.type === "content-element") {
            prop_value = "null as ReactElement";
          }

          const source_hash = hash(prop_value).toString();

          if (result[file]?.source_hash !== source_hash) {
            result[file] = {
              id: item.id,
              comp_def,
              get source() {
                return this[source_sym];
              },
              set source(value: string) {
                this[source_sym] = value;
                this.source_hash = hash(value).toString();
                this.ready = false;
              },
              [source_sym]: prop_value,
              title: `${item.name}.${name}`,
              path_names: path_name,
              prop_name: name,
              path_ids: path_id,
              name: `file:///${file}.tsx`,
              local: { name: "", value: "", auto_render: false },
              loop: { name: "", list: "" },
              extracted_content: "",
              source_hash,
              ready: false,
              exports: {},
            };
          }

          result[file].title = `${item.name}.${name}`;
          if (master_prop.meta?.type === "content-element") {
            if (!prop && master_prop.content) {
              prop = { content: deepClone(master_prop.content) };
              item.component.props[name] = prop;
            }
          }
        }
      }
      if (item.vars) {
        const vars = Object.entries(item.vars);
        if (vars.length > 0) {
          for (const [k, v] of vars) {
            var_items[k] = {
              item_id: item.id,
              get item() {
                return item;
              },
              get var() {
                return v;
              },
            };
          }
        }
      }

      const value = item.adv?.js || "";
      const source_hash = hash(value).toString();
      if (result[item.id]?.source_hash !== source_hash) {
        result[item.id] = {
          id: item.id,
          [source_sym]: value,
          get source() {
            return this[source_sym];
          },
          set source(value: string) {
            this[source_sym] = value;
            this.source_hash = hash(value).toString();
            this.ready = false;
          },
          name: `file:///${item.id}.tsx`,
          path_names: path_name,
          path_ids: path_id,
          title: item.name,
          loop: { name: "", list: "" },
          local: { name: "", value: "", auto_render: false },
          extracted_content: "",
          source_hash,
          ready: false,
          exports: {},
        };
      }
      result[item.id].title = item.name;
    }
  );

  for (const [k, v] of Object.entries(result)) {
    if (v.source && !v.ready) {
      parseItemCode(v);
      if (v.local) {
        v.exports[v.local.name] = {
          name: v.local.name,
          value: v.local.value,
          type: "local",
        };
      }
    }
  }

  // if (p.viref) {
  //   console.log(result, p.viref.item_parents);
  // }
  for (const [k, v] of Object.entries(result)) {
    if (v.source && !v.ready) {
      try {
        v.source = await jscript.prettier.format?.(
          migrateCode(v, result, comp_id)
        );
      } catch (e) {
        console.error(
          `[ERROR] When Formatting Code\n${v.title} ~> ${v.id}\n\n`,
          e
        );
      }
      v.ready = true;
    }
  }

  return result;
};
