import { rapidhash_fast } from "crdt/node/rapidhash";
import { DeepReadonly } from "popup/flow/runtime/types";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import { IItem } from "utils/types/item";
import { parentCompArgs } from "./lib/parent-comp-args";
import {
  local_name,
  parentLocalArgs,
  render_mode,
} from "./lib/parent-local-args";
import { parentPassProps } from "./lib/parent-pass-props";
import { scriptArgs } from "./lib/script-args";
import { useVi } from "./lib/store";
import { createViLocal } from "./script/vi-local";
import { createViPassProp } from "./script/vi-pass-prop";
import { useSnapshot } from "valtio";
import { IF } from "./script/vi-if";
import { ErrorBox } from "./lib/error-box";
import { waitUntil } from "prasi-utils";

export const ViScript: FC<{
  item: DeepReadonly<IItem>;
  childs: ReactElement | null;
  props: React.ClassAttributes<HTMLDivElement> &
    React.HTMLAttributes<HTMLDivElement> & {
      inherit?: {
        style: IItem;
        className: string;
      };
    };
  __idx?: string | number;
  instance_id?: string;
  render: () => void;
}> = ({ item, childs, props, __idx, render }) => {
  const {
    comp_props_parents,
    pass_props_parents,
    parents,
    db,
    api,
    local_value,
    cache_js,
    local_render,
    script_instance,
    dev_item_error: dev_item_error,
    dev_tree_render,
  } = useVi(({ ref }) => ({
    comp_props_parents: ref.comp_props,
    parents: ref.item_parents,
    db: ref.db,
    api: ref.api,
    local_value: ref.local_value,
    pass_props_parents: ref.pass_prop_value,
    cache_js: ref.cache_js,
    local_render: ref.local_render,
    script_instance: ref.script_instance,
    dev_item_error: ref.dev_item_error,
    dev_tree_render: ref.dev_tree_render,
  }));

  local_render[item.id] = render;

  if (!script_instance[item.id]) {
    script_instance[item.id] = {};
  }
  const internal = script_instance[item.id] as {
    Local: any;
    PassProp: any;
    ScriptComponent: any;
    item: DeepReadonly<IItem>;
    watch_auto_render: Record<string, any>;
    arg_hash: string;
  };
  const result = { children: null as any };
  const script_args = scriptArgs({ item, childs, props, result });

  if (item !== internal.item) {
    internal.item = item;
    internal.Local = createViLocal(item, local_value, local_render);
    internal.PassProp = createViPassProp(item, pass_props_parents, __idx);

    if (internal.watch_auto_render) {
      for (const cleanupAutoDispatch of Object.values(
        internal.watch_auto_render
      )) {
        cleanupAutoDispatch();
      }
    }
    internal.watch_auto_render = {};
  }

  useEffect(() => {
    return () => {
      for (const cleanup of Object.values(internal.watch_auto_render)) {
        cleanup();
      }
    };
  }, []);

  const comp_args = parentCompArgs(parents, comp_props_parents, item.id);
  const local_args = parentLocalArgs(local_value, parents, item.id);

  const passprops_args = __idx
    ? parentPassProps(pass_props_parents, parents, item.id, __idx)
    : {};

  for (const [k, v] of Object.entries(comp_args)) {
    if (typeof v === "object" && v && (v as any).__jsx) {
      comp_args[k] = (v as any).__render(item, parents);
    }
  }

  for (const [k, v] of Object.entries(local_args)) {
    if (v.__autorender && v.proxy && v.__item_id !== item.id) {
      local_args[k] = useSnapshot(v.proxy);
      // this is a hack to make valtio only watch accessed properties
      // and not all properties of the object
      local_args[k].__autorender;
    }
  }

  const defineLocal = (arg: {
    name: string;
    value: any;
    render_mode: "auto" | "manual";
  }) => {
    arg.value[local_name] = arg.name;
    arg.value[render_mode] = arg.render_mode;
    return arg.value;
  };

  const final_args = {
    ...comp_args,
    ...script_args,
    ...local_args,
    ...passprops_args,
    db,
    api,
    __js: removeRegion(item.adv!.js || ""),
    defineLocal,
    PassProp: internal.PassProp,
    Local: internal.Local,
    React,
    IF,
    __result: result,
    createElement: function (...arg: any[]) {
      if (arg && Array.isArray(arg) && arg[0] === internal.PassProp && arg[1]) {
        if (!arg[1].idx && arg[1].key) {
          arg[1].idx = arg[1].key;
        } else if (arg[1].idx && !arg[1].key) {
          arg[1].key = arg[1].idx;
        }
      }

      return (React.createElement as any)(...arg);
    },
  };

  const arg_hash = rapidhash_fast(Object.keys(final_args).join("-")).toString();
  const isEditor = (window as any).isEditor as boolean;

  if (!internal.ScriptComponent || internal.arg_hash !== arg_hash) {
    let src = (item.adv!.jsBuilt || "").replace(
      /React\.createElement/g,
      "createElement"
    );
    if (!isEditor) {
      src = `\
try {  
  ${src}\
} catch(e) {
  console.error(e);
}`;
    }

    let src_fn = "";

    src_fn = `\
// ${item.name}: ${item.id} 

${Object.keys(final_args)
  .map((e) => {
    return `const ${e} = p.${e}`;
  })
  .join(";\n")}

{
  ${src}\
}

return __result.children;
`;

    internal.ScriptComponent = new Function("p", src_fn);
    internal.arg_hash = arg_hash;
  }
  final_args.__src = item.adv!.js;
  if (!isEditor) {
    return <internal.ScriptComponent {...final_args} />;
  }

  return (
    <ErrorBox
      silent={true}
      error_jsx={isEditor ? undefined : null}
      onError={async (e) => {
        if (isEditor) {
          dev_item_error[item.id] = e;
          waitUntil(() => dev_tree_render[item.id]).then(() => {
            if (dev_tree_render[item.id]) dev_tree_render[item.id]();
          });
        }
      }}
    >
      <internal.ScriptComponent {...final_args} />
    </ErrorBox>
  );
};

const removeRegion = (src: string) => {
  if (src.startsWith("// #region")) {
    const end = src.indexOf("// #endregion");
    return src.substring(end + 13).trim();
  }
};
