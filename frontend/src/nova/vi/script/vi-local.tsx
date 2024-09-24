import { DeepReadonly } from "popup/script/flow/runtime/types";
import { useEffect } from "react";
import { IItem } from "utils/types/item";
import { useVi } from "vi/lib/store";

export const createViLocal = (
  item: DeepReadonly<IItem>,
  ref_comp_props: Record<string, any>
) => {
  return (opt: {
    name: string;
    value: any;
    effect: (local: any) => void;
    children: any;
  }) => {
    const local = useVi(({ state, ref }) => ({
      ts: state.local_render,
      value: ref.local_value,
    }));

    if (!local.ts[item.id]) {
      if (!ref_comp_props[item.id]) {
        ref_comp_props[item.id] = {};
      }
      ref_comp_props[item.id][opt.name] = local.value[item.id];

      local.value[item.id] = {
        ...opt.value,
        render() {
          local.update((state) => {
            state.local_render[item.id] = Date.now();
          });
        },
      };
    }

    useEffect(() => {
      opt.effect(local.value[item.id]);
    });

    return opt.children;
  };
};