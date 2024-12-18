import { getActiveNode } from "crdt/node/get-node-by-id";
import { active, getActiveTree } from "logic/active";
import { EDGlobal } from "logic/ed-global";
import { PNode } from "logic/types";
import { useCallback, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useGlobal } from "utils/react/use-global";
import { useLocal } from "utils/react/use-local";
import { PrasiFlowEditor } from "./prasi-flow-editor";
import { PrasiFlowProp } from "./prasi-flow-prop";
import { PrasiFlowRunner } from "./prasi-flow-runner";
import { RPFlow } from "./runtime/types";
import { fg } from "./utils/flow-global";
import { defaultFlow } from "./utils/prasi/default-flow";
import { initAdv } from "./utils/prasi/init-adv";

export const EdPrasiFlow = function () {
  // const p = useGlobal(EDGlobal, "EDITOR");
  // const local = useLocal({ fitView() {} });
  // const sflow = p.script.flow;
  // const popup = p.ui.popup.script;
  // const node = getActiveNode(p);
  // const prasi = fg.prasi;
  // fg.render = local.render;

  // const resetDefault = useCallback(() => {
  //   const afterReset = (node: PNode) => {
  //     if (node) {
  //       localStorage.removeItem(`prasi-flow-vp-${`item-${node.item.id}`}`);
  //       sflow.current = structuredClone(
  //         defaultFlow("item", `item-${node.item.id}`, node.item.id)
  //       );
  //       local.render();
  //       setTimeout(() => {
  //         local.fitView();
  //       }, 500);
  //     }
  //   };
  //   if (node?.item.adv?.flow) {
  //     fg.updateNoDebounce(
  //       "Flow Reset",
  //       ({ node }) => {
  //         if (!node.item.adv) node.item.adv = {};
  //         delete node.item.adv.flow;
  //       },
  //       ({ node }) => {
  //         afterReset(node);
  //       }
  //     );
  //   } else if (node) {
  //     afterReset(node);
  //   }
  // }, [node?.item.id, fg.updateNoDebounce]);

  // fg.prasi.resetDefault = resetDefault;

  // useEffect(() => {
  //   const tree = getActiveTree(p);

  //   if (node && tree) {
  //     if (
  //       popup.prop_name === "" &&
  //       (popup.mode === "js" || popup.mode === "flow")
  //     ) {
  //       if (node.item.id !== prasi.item_id) {
  //         initAdv(node, tree);
  //         prasi.item_id = node.item.id;
  //         fg.updateNoDebounce = (
  //           action_name: string,
  //           fn,
  //           next?: (arg: { pflow?: RPFlow | null; node: PNode }) => void
  //         ) => {
  //           tree.update(
  //             action_name,
  //             ({ findNode }) => {
  //               const node = findNode(active.item_id);

  //               if (node) {
  //                 if (!node.item.adv) {
  //                   node.item.adv = {};
  //                 }

  //                 if (!node.item.adv?.flow && sflow.current) {
  //                   node.item.adv.flow = sflow.current as any;
  //                 }

  //                 if (node.item.adv?.flow) {
  //                   fn({ pflow: node.item.adv.flow, node });
  //                 }
  //               }
  //             },
  //             ({ findNode }) => {
  //               const n = findNode(node.item.id);

  //               if (next && n) {
  //                 next({ pflow: n?.item.adv?.flow, node: n });
  //               } else {
  //                 sflow.current = n?.item.adv?.flow || null;
  //               }
  //             }
  //           );
  //         };
  //         fg.update = (
  //           action_name: string,
  //           fn,
  //           next?: (arg: { pflow?: RPFlow | null }) => void
  //         ) => {
  //           clearTimeout(fg.update_timeout);
  //           fg.update_timeout = setTimeout(() => {
  //             fg.updateNoDebounce(action_name, fn, next);
  //           }, 100);
  //         };

  //         if (
  //           !node.item.adv?.flow ||
  //           (node.item.adv?.flow &&
  //             !Object.values(node.item.adv.flow.nodes).find(
  //               (e) => e.type === "start"
  //             ))
  //         ) {
  //           sflow.current = defaultFlow(
  //             "item",
  //             `item-${node.item.id}`,
  //             node.item.id
  //           );
  //           return;
  //         }
  //       }

  //       if (node.item.adv?.flow) {
  //         sflow.current = node.item.adv.flow;
  //         local.render();
  //       }
  //     }
  //   }
  // }, [node?.item.id, sflow.current, prasi.updated_outside, node]);

  // if (!sflow.current) return null;

  // return (
  //   <>
  //     <PanelGroup direction="horizontal" className="select-none">
  //       <Panel>
  //         <PanelGroup direction="vertical">
  //           <Panel>
  //             <PrasiFlowEditor
  //               update_on_relayout={!!node?.item.adv?.flow}
  //               resetDefault={resetDefault}
  //               pflow={sflow.current}
  //               bind={({ fitView }) => {
  //                 local.fitView = fitView;
  //               }}
  //             />
  //           </Panel>

  //           <PanelResizeHandle className={"border-t"} />
  //           <Panel
  //             defaultSize={
  //               Number(localStorage.getItem("prasi-flow-panel-v")) || 25
  //             }
  //             className={css`
  //               min-height: 40px;
  //             `}
  //             onResize={(size) => {
  //               localStorage.setItem("prasi-flow-panel-v", size + "");
  //             }}
  //           >
  //             <PrasiFlowRunner pflow={sflow.current} />
  //           </Panel>
  //         </PanelGroup>
  //       </Panel>

  //       <PanelResizeHandle className={"border-l"} />
  //       <Panel
  //         defaultSize={Number(localStorage.getItem("prasi-flow-panel-h")) || 15}
  //         onResize={(size) => {
  //           localStorage.setItem("prasi-flow-panel-h", size + "");
  //         }}
  //         className={css`
  //           min-width: 250px;
  //         `}
  //       >
  //         <PrasiFlowProp pflow={sflow.current} />
  //       </Panel>
  //     </PanelGroup>
  //   </>
  // );
};
