import { Tree as DNDTree } from "@minoru/react-dnd-treeview";
import { CompTree, loadCompTree } from "crdt/load-comp-tree";
import { active } from "logic/active";
import { EDGlobal } from "logic/ed-global";
import { PNode } from "logic/types";
import { FC } from "react";
import { useGlobal } from "utils/react/use-global";
import { ErrorBox } from "../../vi/lib/error-box";
import { TopBtn } from "../ui/top-btn";
import { nodeRender } from "./parts/node/node-render";
import { treeCanDrop, treeOnDrop } from "./parts/on-drop";
import { doTreeSearch } from "./parts/search";
import { indentTree, useTreeIndent } from "./parts/use-indent";
import { DragPreview, Placeholder } from "./parts/drag-preview";
import { waitUntil } from "prasi-utils";
import { ArrowLeft, Bolt, FileSliders } from "lucide-react";
import { getActiveNode } from "crdt/node/get-node-by-id";

const t = { out: null as any };
export const EdCompTree: FC<{ tree: CompTree }> = ({ tree }) => {
  const p = useGlobal(EDGlobal, "EDITOR");

  useTreeIndent(p);

  const TypedTree = DNDTree<PNode>;

  let models = tree.nodes.models;
  if (p.ui.tree.search.value) {
    models = doTreeSearch(p);
  }
  const comp = p.comp.loaded[active.comp_id];

  return (
    <div className="flex-1 flex flex-col items-stretch border-2 border-purple-700">
      <div className="flex text-xs p-1 border-b justify-between bg-purple-700 text-white items-stretch">
        Editing Component: {comp?.content_tree?.name}
      </div>
      <div className="flex text-xs p-1 border-b justify-between bg-purple-100 items-stretch">
        <TopBtn
          className={cx(
            "text-[11px] bg-white space-x-1",
            css`
              padding: 0 5px;
            `
          )}
          onClick={async () => {
            if (active.comp) {
              active.comp.destroy();
              active.comp = null;
              active.comp_id = "";
              if (p.ui.comp.last_edit_ids.length > 0 && p.sync) {
                const id = p.ui.comp.last_edit_ids.pop();
                if (id) {
                  active.comp = await loadCompTree({
                    sync: p.sync,
                    id: id,
                    p,
                    async on_update(ctree) {
                      if (!p.comp.loaded[id]) {
                        await waitUntil(() => p.comp.loaded[id]);
                      }

                      if (p.viref.resetCompInstance)
                        p.viref.resetCompInstance(id);
                      p.comp.loaded[id].content_tree = ctree;
                      p.render();
                      p.ui.editor.render();
                    },
                  });
                  p.ui.comp.loading_id = "";
                  p.render();
                }
              }

              p.render();
            }
          }}
        >
          <ArrowLeft size={12} />
          <div>Back</div>
        </TopBtn>
        <TopBtn
          className={cx(
            "text-[11px] bg-white space-x-1",
            css`
              padding: 0 5px;
            `
          )}
        >
          <Bolt size={12} />
          <div>Edit Master Props</div>
        </TopBtn>
      </div>
      <div className={cx("flex flex-1 relative overflow-auto")}>
        <div className="absolute inset-0">
          <ErrorBox>
            <TypedTree
              tree={models}
              ref={(ref) => {
                if (!p.ui.tree.ref) {
                  waitUntil(async () => {
                    return document.querySelector(".tree-item");
                  }).then(() => {
                    indentTree(p);
                  });
                }
                if (ref) {
                  p.ui.tree.ref = ref;
                }
              }}
              rootId={"root"}
              render={nodeRender}
              canDrag={(node) => {
                if (node) {
                  if (node.data?.parent?.component?.is_jsx_root) {
                    return false;
                  }
                }

                return true;
              }}
              sort={false}
              insertDroppableFirst={false}
              dropTargetOffset={10}
              canDrop={(_, args) => {
                if (!args.dragSource?.data?.item) return false;
                return treeCanDrop(p, args);
              }}
              onDrop={(tree, options) => treeOnDrop(p, tree, options)}
              dragPreviewRender={DragPreview}
              placeholderRender={(node, params) => (
                <Placeholder node={node} params={params} />
              )}
            />
          </ErrorBox>
        </div>
      </div>
    </div>
  );
};
