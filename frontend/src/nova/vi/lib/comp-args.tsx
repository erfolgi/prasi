import { DeepReadonly } from "popup/flow/runtime/types";
import { IItem } from "utils/types/item";
import { ViRender } from "vi/vi-render";
import { ViComps } from "./types";

export const compArgs = (
  item: DeepReadonly<IItem>,
  comps: ViComps,
  existing: any,
  db: any,
  api: any,
  vscode_exports: any,
  standalone?: string
) => {
  const inject = {} as any;
  const args: Record<string, any> = { ...existing };
  if (item.component?.props) {
    const comp_id = item.component.id;
    const comp = comps[comp_id];

    if (comp.component) {
      for (const [k, prop] of Object.entries(comp.component.props)) {
        if (!k.endsWith("__")) {
          let iprop = item.component.props[k];
          if (!iprop) {
            //@ts-ignore
            iprop = prop;
          }

          try {
            let src = iprop.valueBuilt || iprop.value;
            const args = {
              ...vscode_exports,
              db,
              api,
              ...existing,
            };
            if (!src.startsWith(`//prasi-prop`)) {
              src = `return ${src}`;
            }
            const fn = new Function(...Object.keys(args), src);
            inject[k] = fn(...Object.values(args));
          } catch (e) {}
        }
      }
    }

    for (const [k, master_prop] of Object.entries(
      comp.component?.props || {}
    )) {
      const prop = item.component.props[k];
      let js = prop.valueBuilt || "";

      if (master_prop.meta?.type === "content-element") {
        const content = prop.content;
        if (content) {
          args[k] = {
            __jsx: true,
            __LazyChild: ({
              parents,
              parent,
            }: {
              parents: any;
              parent: any;
            }) => {
              parents[content.id] = parent.id;
              return (
                <ViRender
                  is_layout={false}
                  instance_id={item.id}
                  item={content}
                  standalone={standalone}
                />
              );
            },
            __render(parent: IItem, parents: Record<string, string>) {
              return <this.__LazyChild parent={parent} parents={parents} />;
            },
          };
        } else {
          args[k] = null;
        }
        continue;
      }

      if (js.startsWith(`const _jsxFileName = "";`)) {
        js = `(() => { ${js.replace(
          `const _jsxFileName = "";`,
          `const _jsxFileName = ""; return `
        )} })()`;
      }

      const src = replaceWithObject(js, replacement) || "";

      const exports = (window as any).exports;
      const arg = {
        ...exports,
        db,
        api,
        ...existing,
        ...inject,
      };

      let fn_src = `// [${item.name}] ${k}: ${item.id}
return ${src}
`;
      if (src.startsWith(`//prasi-prop`)) {
        fn_src = `// [${item.name}] ${k}: ${item.id}
${src.substring(`//prasi-prop`.length + 1)}`;
      }
      try {
        const fn = new Function(
          ...Object.keys(arg),
          `\
  try { 
    ${fn_src.split("\n").join(`\n    `)}
  } catch(e) {
    console.error(e);
  }`
        );

        args[k] = fn(...Object.values(arg));
      } catch (e) {
        console.error(fn_src, e);
        arg[k] = null;
      }
    }
  }
  return { ...inject, ...args };
};

export const replacement = {
  "stroke-width": "strokeWidth",
  "fill-rule": "fillRule",
  "clip-rule": "clipRule",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-linecap": "strokeLinecap",
  "clip-path": "clipPath",
  "stroke-miterlimit": "strokeMiterlimit",
};

export const replaceWithObject = (tpl: string, data: any) => {
  let res = tpl;
  for (const [k, v] of Object.entries(data)) {
    res = res.replaceAll(k, v as string);
  }
  return res;
};
