import { gunzipSync } from "bun";
import type { ServerCtx } from "../utils/server/ctx";
import { decode } from "msgpackr";
import hash_sum from "hash-sum";
import { codeHistory, crdt_comps, crdt_pages } from "../ws/crdt/shared";
import { loopItem } from "prasi-frontend/src/nova/ed/crdt/node/loop-item";
export type ICodeHistory = {
  page_id?: string;
  comp_id?: string;
  item_id: string;
  type: "prop" | "js";
  prop_name?: string;
};

export default {
  url: "/code_history",
  async api(ctx: ServerCtx) {
    const { req } = ctx;
    const body = decode(gunzipSync(await req.arrayBuffer())) as {
      mode: "update";
      site_id: string;
      selector: ICodeHistory[];
    };

    if (body.mode === "update") {
      for (const sel of body.selector) {
        const timeout_id = hash_sum(sel);
        clearTimeout(codeHistory.timeout[timeout_id]);
        setTimeout(() => {
          delete codeHistory.timeout[timeout_id];
          const { page_id, comp_id } = sel;
          let items = [] as any[];
          if (page_id) {
            const page = crdt_pages[page_id];
            if (page) {
              items = page.doc.getMap("data")?.toJSON().childs;
            }
          } else if (comp_id) {
            const comp = crdt_comps[comp_id];
            if (comp) {
              items = [comp.doc.getMap("data")?.toJSON()];
            }
          }

          if (items.length > 0) {
            loopItem(items, { active_comp_id: comp_id }, async ({ item }) => {
              if (item.id === sel.item_id) {
                let text = "";
                if (sel.type !== "prop") {
                  text = item.adv[sel.type] || "";
                } else {
                  text = item.component.props[sel.prop_name].value;
                }
                if (page_id) {
                  codeHistory.site(body.site_id).tables.page_code.save({
                    item_id: sel.item_id,
                    page_id: page_id,
                    prop_name: sel.prop_name || "",
                    type: sel.type,
                    ts: Date.now(),
                    text,
                  });
                } else if (comp_id) {
                  codeHistory.comp(comp_id).tables.comp_code.save({
                    item_id: sel.item_id,
                    comp_id: comp_id,
                    prop_name: sel.prop_name || "",
                    type: sel.type,
                    ts: Date.now(),
                    text,
                  });
                }
              }
            });
          }
        }, 10 * 1000);
      }
    }

    return new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
    });
  },
};
