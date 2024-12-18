import set from "lodash.set";
import { active, getActiveTree } from "logic/active";
import { EDGlobal } from "logic/ed-global";
import {
  ChevronDown,
  ChevronRight,
  Clipboard,
  Copy,
  GripVertical,
  Plus,
  Square,
  SquareCheckBig,
  Trash2,
} from "lucide-react";
import { useRef } from "react";
import { List } from "react-movable";
import { useGlobal } from "utils/react/use-global";
import { useLocal } from "utils/react/use-local";
import { Tooltip } from "utils/ui/tooltip";
import { propGroupInfo } from "../parts/prop-group-info";
import { sortProp } from "../parts/sort-prop";
import { EdMasterPropName } from "./ed-mp-name";

type PROP_NAME = string;

export const EdMasterProp = () => {
  const p = useGlobal(EDGlobal, "EDITOR");
  const local = useLocal({
    checked: new Set<PROP_NAME>(),
    all: false,
  });
  const item = active.comp?.snapshot;
  const comp = item?.component;
  const dragbox = useRef<HTMLDivElement>(null);
  if (!comp) return null;

  const props = item.component?.props || {};
  const sorted_props = sortProp(props);

  return (
    <div className="flex flex-col items-stretch flex-1 w-full h-full text-sm">
      <div
        className={cx(
          "bg-purple-100 flex justify-between border-b h-[28px]",
          css`
            .top-btn {
              display: flex;
              align-items: center;
              flex-wrap: nowrap;
              flex-direction: row;
              font-size: 12px;
              border: 1px solid #ccc;
              padding: 0px 5px;
              height: 20px;
              background: white;
              color: black;
              cursor: pointer;
              user-select: none;
              &:hover {
                background: #edf0f9;
              }
            }
          `
        )}
      >
        <div className="p-1 space-x-1 flex-1 flex">
          <div
            className={cx(
              "top-btn ml-[11px]",
              css`
                border: 0 !important;
                background: transparent !important;
              `
            )}
            onClick={() => {
              local.all = !local.all;
              if (local.all) {
                local.checked = new Set(Object.keys(props));
              } else {
                local.checked = new Set();
              }
              local.render();
            }}
          >
            {local.all ? (
              <SquareCheckBig size={13} fill="white" />
            ) : (
              <Square size={13} fill="white" />
            )}
          </div>
          {local.checked.size > 0 && (
            <>
              <Tooltip
                content="Remove selected Master Props"
                className="top-btn"
                onClick={() => {
                  if (confirm("Remove selected Master Props?")) {
                    getActiveTree(p).update(
                      "Remove Master Prop",
                      ({ findNode }) => {
                        const node = findNode(item.id);
                        const props = node?.item.component?.props;
                        if (props) {
                          for (const key of local.checked) {
                            delete props[key];
                          }
                        }
                      }
                    );
                  }
                }}
              >
                <Trash2 size={13} />
              </Tooltip>

              <Tooltip
                content="Copy selected Master Props to clipboard"
                className="top-btn"
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(
                      [...local.checked].map((e) => {
                        return { name: e, prop: props[e] };
                      })
                    )
                  );
                  alert(
                    local.checked.size + " Master Props copied to clipboard"
                  );
                }}
              >
                <Copy size={13} />
              </Tooltip>
            </>
          )}

          <Tooltip
            content="Paste Master Props from clipboard"
            className="top-btn"
            onClick={async () => {
              try {
                const pasted = JSON.parse(await navigator.clipboard.readText());

                if (Array.isArray(pasted)) {
                  getActiveTree(p).update(
                    "Paste Master Prop",
                    ({ findNode }) => {
                      const node = findNode(item.id);
                      const props = node?.item.component?.props;
                      if (props) {
                        for (const item of pasted) {
                          if (item.name && item.prop) {
                            props[item.name] = item.prop;
                          }
                        }
                      }
                    }
                  );
                }
              } catch (e) {}
            }}
          >
            <Clipboard size={13} />
          </Tooltip>
        </div>
        <div className="p-1 space-x-1">
          <div
            className="top-btn"
            onClick={() => {
              getActiveTree(p).update("Add Master Prop", ({ findNode }) => {
                const node = findNode(item.id);
                const props = node?.item.component?.props;
                if (props) {
                  let idx = 1;
                  while (props[`prop_${idx}`]) {
                    idx++;
                  }
                  const name = `prop_${idx}`;
                  props[name] = {
                    type: "string",
                    label: `Prop ${idx}`,
                    value: '""',
                    valueBuilt: '""',
                    meta: {
                      type: "text",
                    },
                    idx,
                  };
                  p.ui.tree.comp.active = name;
                }
              });
            }}
          >
            <Plus size={13} /> Master Prop
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto" ref={dragbox}>
        <List
          values={sorted_props}
          lockVertically
          container={dragbox.current}
          renderItem={({ value, props, isDragged }) => {
            const { is_group, is_group_child, group_name, group_expanded } =
              propGroupInfo(p, value, active.comp_id);

            if (is_group && is_group_child && !group_expanded) {
              return <li {...props} key={value[0]} className="h-[0px]"></li>;
            }

            const is_active = p.ui.tree.comp.active === value[0];
            const drag_handle = (
              <div
                onPointerMove={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="w-[15px] text-slate-500 flex items-center justify-center border-r hover:bg-blue-600 hover:text-white"
              >
                <GripVertical size={14} />
              </div>
            );
            delete props.key;
            return (
              <li
                key={value[0]}
                {...props}
                className={cx(
                  "list-none cursor-pointer bg-white flex border-b",
                  isDragged ? "border-t" : ""
                )}
              >
                {isDragged ? (
                  drag_handle
                ) : (
                  <Tooltip
                    content={<div>Drag to reorder</div>}
                    delay={0.2}
                    asChild
                  >
                    {drag_handle}
                  </Tooltip>
                )}

                <div
                  className={cx(
                    "flex-1 flex",
                    local.checked.has(value[0]) &&
                      cx(
                        "bg-purple-500 text-white",
                        css`
                          * {
                            border-color: transparent !important;
                            background-color: transparent !important;
                          }
                        `
                      )
                  )}
                  onPointerDown={(e) => {
                    if (p.ui.tree.comp.active === value[0]) {
                      return;
                    }
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <div
                    onClick={() => {
                      if (!local.checked.has(value[0])) {
                        local.checked.add(value[0]);
                      } else {
                        local.checked.delete(value[0]);
                      }
                      local.render();
                    }}
                    className={cx(
                      "flex items-center justify-center border-r w-[23px]"
                    )}
                  >
                    {local.checked.has(value[0]) ? (
                      <SquareCheckBig size={13} />
                    ) : (
                      <Square size={13} />
                    )}
                  </div>

                  {is_group && (
                    <div
                      className={cx(
                        "w-[20px] flex",
                        is_active ? "bg-blue-500 text-white" : ""
                      )}
                    >
                      {!is_group_child && (
                        <div
                          className="flex-1 flex items-center justify-center"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!group_expanded) {
                              set(
                                p.ui.comp.prop.expanded,
                                `${active.comp_id}.${group_name}`,
                                true
                              );
                            } else {
                              set(
                                p.ui.comp.prop.expanded,
                                `${active.comp_id}.${group_name}`,
                                false
                              );
                            }
                            p.render();
                          }}
                        >
                          {group_expanded ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <EdMasterPropName name={value[0]} prop={value[1]} />
                </div>
              </li>
            );
          }}
          onChange={({ oldIndex, newIndex }) => {
            getActiveTree(p).update("Reorder Master Prop", ({ tree }) => {
              if (tree.type === "item") {
                const from = sorted_props[oldIndex][0];
                const to = sorted_props[newIndex][0];
                const props = tree.component?.props;
                if (props) {
                  props[to].idx = oldIndex;
                  props[from].idx = newIndex;
                }
              }
            });
          }}
          renderList={({ children, props }) => {
            return (
              <ul className="absolute inset-0" {...props}>
                {children}
              </ul>
            );
          }}
        />
      </div>
    </div>
  );
};
