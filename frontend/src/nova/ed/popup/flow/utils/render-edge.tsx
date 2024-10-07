import {
  BaseEdge,
  Edge,
  EdgeComponentProps,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react";
import { PFNodeBranch, PFNodeDefinition } from "../runtime/types";
import { fg } from "./flow-global";

import { useState } from "react";
import { allNodeDefinitions } from "../runtime/nodes";
export const RenderEdge = function ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeComponentProps) {
  const { getEdge } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edge = (id ? getEdge(id) : undefined) as unknown as Edge<{
    branch: PFNodeBranch;
  }>;
  const pflow = fg.pflow;
  const name = edge?.data?.branch?.name || "";
  const is_branch = !!edge?.data?.branch;
  const from = pflow.nodes[edge.source];
  const from_def = (allNodeDefinitions as any)?.[
    from.type
  ] as PFNodeDefinition<any>;

  if (!from_def) return null; 

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className={cx(
            "nodrag nopan absolute edge-" + id,
            css`
              font-size: 11px;
              pointer-events: all;
              cursor: pointer;
              background: white;
              transform: translate(-50%, -50%)
                translate(${labelX}px, ${labelY}px);
              .plus {
                opacity: 0;
              }
              /* &:hover {
                .label {
                  opacity: 0;
                }
                .plus {
                  opacity: 1;
                }
              } */
            `,
            !name &&
              css`
                .plus {
                  opacity: 0.4 !important;
                  transform: translate(-50%, -50%);
                  &:hover {
                    opacity: 1 !important;
                  }
                }
                .label {
                  display: none;
                }
              `
          )}
          onClick={(e) => {
            // if (is_branch) return true;
            // e.stopPropagation();
            // e.preventDefault();
            // if (id) {
            //   const edge = getEdge(id);
            //   const pf = pflow;
            //   if (edge && pf) {
            //     const node = pf.nodes[edge.source];
            //     let from = null as null | { flow: string[]; idx: number };
            //     if ((node.branches || []).length > 0) {
            //       for (const branch of node.branches!) {
            //         const idx = branch.flow.findIndex((e) => e === edge.target);
            //         if (idx >= 0) {
            //           from = { flow: branch.flow, idx: idx - 1 };
            //           break;
            //         }
            //       }
            //     } else {
            //       from = findFlow({ id: edge.source, pflow: pf });
            //     }
            //     const source = pf.nodes[edge.source];
            //     const target = pf.nodes[edge.target];
            //     if (
            //       from &&
            //       source &&
            //       source.position &&
            //       target &&
            //       target.position
            //     ) {
            //       source.position.y -= 20;
            //       target.position.y += 20;
            //       const pf_node: PFNode = {
            //         id: createId(),
            //         type: "code",
            //         position: {
            //           x: source.position.x,
            //           y: source.position.y + 75,
            //         },
            //       };
            //       pf.nodes[pf_node.id] = pf_node;
            //       from.flow.splice(from.idx + 1, 0, pf_node.id);
            //       savePF("Create Node", pf);
            //       fg.reload();
            //       setTimeout(() => {
            //         fg.main?.action.resetSelectedElements();
            //         fg.main?.action.addSelectedNodes([pf_node.id]);
            //       });
            //     }
            //   }
            // }
          }}
        >
          <div className={"label"}>
            {from_def?.render_edge_label
              ? from_def.render_edge_label({
                  node: from,
                  branch: edge.data?.branch,
                })
              : name}
          </div>
          {/* {!is_branch && (
            <button
              className={cx(
                "plus absolute transition-all flex items-center justify-center",
                css`
                  transform: translate(50%, -100%);
                  width: 20px;
                  height: 20px;
                  background: #eee;
                  border: 1px solid #fff;
                  border-radius: 50%;
                  font-size: 12px;
                  line-height: 1;
                `
              )}
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`,
              }}
            />
          )} */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};