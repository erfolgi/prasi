import {
  Handle,
  Node,
  NodeResizer,
  Position,
  useConnection,
  useStore,
} from "@xyflow/react";
import { Check, Maximize2, TriangleAlert } from "lucide-react";
import { useRef } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useLocal } from "utils/react/use-local";
import { Tooltip } from "utils/ui/tooltip";
import { allNodeDefinitions } from "../runtime/nodes";
import { PFNodeDefinition } from "../runtime/types";
import { fg } from "./flow-global";
import { NodeTypeLabel } from "./node-type-label";
import { NodeTypePicker } from "./type-picker";

export const RenderNode = function (arg: {
  id: string;
  data: { label: string; type: string };
}) {
  const pflow = fg.pflow;
  const local = useLocal({ type_opened: false });
  const { data, id } = arg;
  const connection = useConnection<Node>();
  const ref_name = useRef<HTMLTextAreaElement>(null);
  const ref_node = useRef<HTMLDivElement>(null);

  useStore((actions) => ({
    add: actions.addSelectedNodes,
    reset: actions.resetSelectedElements,
  }));

  if (connection.inProgress) {
    fg.pointer_to = connection.to;
  }

  const node = pflow.nodes[id];
  const def: PFNodeDefinition<any> = node
    ? (allNodeDefinitions as any)[node.type]
    : undefined;

  const left = data.type === "start" ? 38 : 74;

  if (!node) {
    return null;
  }

  const has_error = Object.keys(node._codeError || {}).length > 0;

  return (
    <div
      tabIndex={0}
      id={`pf-${node.id}`}
      onKeyDown={(e) => {
        if (e.key.length === 1 && !local.type_opened) {
          const input: HTMLInputElement | null = document.querySelector(
            "#prasi-flow-node-name"
          );
          if (input) {
            input.focus();
          }
        }
      }}
      ref={ref_node}
      className={cx(
        "border border-slate-600  rounded-sm",
        def?.className,
        !node?.name && "items-center justify-center flex",
        node?.size?.w &&
          css`
            width: ${node.size.w}px;
          `,
        node?.size?.h &&
          css`
            height: ${node.size.h}px;
          `,
        css`
          .react-flow__resize-control.handle {
            width: 10px !important;
            height: 10px !important;
            border-radius: 3px !important;
          }
        `,
        css`
          .source-edge svg,
          .node-move,
          .node-id {
            opacity: 0;
          }
          &:hover {
            .source-edge sv,
            .node-move,
            .node-id {
              opacity: 1;
            }
          }
        `,
        fg.prop?.selection.nodes?.find((e) => e.id === id) &&
          css`
            border: 1px solid ${has_error ? "red" : "blue"};
            outline: 1px solid ${has_error ? "red" : "blue"};
          `,
        fg.node_running.length > 0 &&
          css`
            .node-type {
              color: black;
            }
          `,

        fg.node_running.includes(arg.id) &&
          css`
            color: white;
            background: #419625 !important;
            border: 1px solid #419625;
          `,
        // (fg.node_running[fg.node_running.length - 1] === id ||
        // !pflow!.nodes[arg.id].branches
        //   ? css`
        //       color: white;
        //       background: #419625 !important;
        //       border: 1px solid #419625;
        //     `
        //   : css`
        //       background: #f8f5d5 !important;
        //       border: 1px solid #91860c;
        //     `),

        fg.run?.visited?.find((e) => e.node.id === arg.id) &&
          css`
            background: #f3ffef;
            border: 1px solid #175203;
          `
      )}
      onPointerUp={() => {
        if (connection.inProgress && connection.fromNode.id) {
          fg.pointer_up_id = id;
        }

        if (fg.prop?.selection.nodes.find((e) => e.id === id)) {
          ref_name.current?.select();
        }
      }}
    >
      {has_error && (
        <div className="absolute right-0 top-[8px] pointer-events-none">
          <div className="text-xs cursor-pointer text-red-600 flex items-center mr-2">
            <TriangleAlert size={12} />
          </div>
        </div>
      )}

      {node && fg.resizing.has(node.id) && (
        <NodeResizer
          onResize={(e, p) => {
            if (node) {
              clearTimeout(fg.update_timeout);
              fg.update_timeout = setTimeout(() => {
                fg.updateNoDebounce("Resize Node", ({ pflow }) => {
                  const n = pflow.nodes[node.id];
                  if (n) {
                    n.size = { w: p.width, h: p.height };
                  }
                });
              }, 300);
            }
          }}
          onResizeEnd={() => {
            // savePF("Resize Node", pflow);
          }}
        />
      )}

      <div className="node-id transition-all absolute top-[-15px] left-0 text-[8px] pointer-events-none">
        {id}
      </div>

      {/* <div
        className={cx(
          "node-move transition-all",
          css`
            position: absolute;
            top: 3px;
            right: -30px;
            padding-left: 5px;
          `
        )}
      >
        <div
          className={cx(
            "flex items-center justify-center cursor-hand",
            css`
              width: 25px;
              height: 25px;
              border: 1px dashed black;
              border-radius: 5px;
              &:hover {
                border: 1px solid blue;
                background: blue;
                svg {
                  color: white;
                }
              }
            `
          )}
        >
          <Move size={14} />
        </div>
      </div> */}
      {node && (
        <Tooltip
          content={
            !fg.resizing.has(node.id) ? "Move / Resize Node" : "Done Resizing"
          }
          className={cx(
            "node-move transition-all",
            css`
              position: absolute;
              padding-left: 5px;
              top: 3px;
              right: -30px;
            `
          )}
          onClick={() => {
            if (node) {
              if (fg.resizing.has(node.id)) {
                fg.resizing.delete(node.id);
              } else {
                fg.resizing.add(node.id);
              }
              fg.render();
            }
          }}
        >
          <div
            className={cx(
              "flex items-center justify-center cursor-pointer",
              css`
                width: 25px;
                height: 25px;
                border: 1px dashed black;
                border-radius: 5px;
                &:hover {
                  border: 1px solid blue;
                  background: blue;
                  svg {
                    color: white;
                  }
                }
              `
            )}
          >
            {fg.resizing.has(node.id) ? (
              <Check size={14} />
            ) : (
              <Maximize2 size={14} />
            )}
          </div>
        </Tooltip>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className={cx(
          "source-edge",
          css`
            position: absolute !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1 !important;
            left: 0 !important ;
            top: 0 !important;
            transform: none !important;
            border-radius: 0 !important;
            border: 0 !important;
            background: transparent !important;

            /* border-radius: 0;
            border: 1px solid transparent;
            background: none;
            &:after {
              content: "";
              position: absolute;
              width: 25px;
              height: 25px;
              transform: none;
              top: -25px;
              left: ${left}px;
              border-radius: 3px;
              border: 1px dashed transparent;
            }

            &:hover {
              border: 1px solid black;
              background: black;

              &:after {
                border: 1px dashed black;
              }
            } */
          `
        )}
      ></Handle>
      <Handle
        type="target"
        position={Position.Top}
        className={cx("opacity-0")}
      />
      {node && def && (
        <div
          className={cx(
            "flex flex-col items-stretch",
            data.type !== "start" ? "min-w-[137px] " : "min-w-[65px] "
          )}
        >
          {node.name && data.type !== "start" && (
            <div
              className={cx(
                "flex items-center py-1 px-2 border-b border-t-slate-500"
              )}
            >
              <TextareaAutosize
                value={node.name}
                spellCheck={false}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                rows={1}
                ref={ref_name}
                className={cx(
                  "flex flex-1 bg-transparent min-w-0 w-0 outline-none resize-none text-[15px] items-center flex-col"
                )}
              ></TextareaAutosize>
            </div>
          )}
          <div
            className={cx(
              "line-type flex items-center ",
              !node.name && node.type !== "start" && "justify-center",
              css`
                svg {
                  width: 14px;
                  height: 14px;
                }
              `
            )}
          >
            <div
              className={cx(css`
                height: 28px;
              `)}
            ></div>
            <NodeTypePicker
              onOpenChange={(value) => {
                console.log("open change", value);
                local.type_opened = value;
                local.render();
              }}
              options={Object.keys(allNodeDefinitions)
                .filter((e) => e !== "start")
                .map((e) => {
                  const def = (allNodeDefinitions as any)[
                    e
                  ] as PFNodeDefinition<any>;
                  return {
                    value: e,
                    label: def.type,
                    el: (
                      <>
                        <div
                          className={css`
                            svg {
                              width: 12px;
                              height: 12px;
                              margin-right: 5px;
                            }
                          `}
                          dangerouslySetInnerHTML={{ __html: def.icon }}
                        ></div>

                        <NodeTypeLabel node={def} />
                      </>
                    ),
                  };
                })}
              defaultValue={data.type}
              onChange={(value) => {
                data.type = value;
                local.type_opened = false;
                const pf = pflow;
                if (pf) {
                  const node = pf.nodes[id];
                  fg.updateNoDebounce("Flow Change Node Type", ({ pflow }) => {
                    const n = pflow.nodes[node.id];
                    if (n) {
                      n.type = value;

                      const on_init = (allNodeDefinitions as any)[n.type]
                        ?.on_init;
                      if (on_init) {
                        on_init({
                          node: n,
                          flow: pflow.flow,
                          nodes: pflow.nodes,
                        });
                      }
                    }
                  });
                }
              }}
            >
              {({ setOpen, open }) => (
                <div
                  className={cx(
                    "flex",
                    node.type !== "start"
                      ? "absolute z-10 items-stretch justify-center px-1"
                      : "item-center w-full"
                  )}
                  onPointerUp={(e) => {
                    if (node.type !== "start") {
                      if (connection.inProgress) {
                        return;
                      }
                      e.stopPropagation();

                      local.type_opened = open;
                      local.render();
                      setTimeout(() => {
                        setOpen(true);
                      });
                    }
                  }}
                >
                  <div
                    className={
                      node.type === "start"
                        ? "flex items-center justify-center w-full h-full flex-1 space-x-1"
                        : cx(
                            node.name ? "mr-[2px]" : "justify-center",
                            "flex-1 flex hover:bg-blue-700 hover:text-white rounded-[3px] py-[2px] px-[6px] flex-row items-center",
                            css`
                              cursor: pointer !important;
                            `
                          )
                    }
                  >
                    <div dangerouslySetInnerHTML={{ __html: def.icon }}></div>
                    <div className="flex space-x-1">
                      <NodeTypeLabel node={def} />
                    </div>
                  </div>
                </div>
              )}
            </NodeTypePicker>
          </div>
        </div>
      )}
    </div>
  );
};
