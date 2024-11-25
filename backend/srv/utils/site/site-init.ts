import { editor } from "utils/editor";
import { siteLoadingData } from "./loading-checklist/load-data";
import { siteLoadingMode } from "./loading-checklist/load-mode";
import { siteLoadingMessage } from "./loading-checklist/loading-msg";
import { siteNew } from "./loading-checklist/site-new";
import { siteRun } from "./loading-checklist/site-run";
import { siteUpgrade } from "./loading-checklist/site-upgrade";

export const siteInit = async (site_id: string, conn_id?: string) => {
  if (!g.site.loaded[site_id]) {
    let loading = g.site.loading[site_id];
    if (!loading) {
      g.site.loading[site_id] = {
        status: "",
        build: {},
      };
      loading = g.site.loading[site_id];
      siteLoadingMessage(site_id, "Site Initializing...");

      await siteLoadingData(site_id, loading);
      if (!loading.mode) {
        await siteLoadingMode(site_id, loading);

        if (loading.mode === "new") await siteNew(site_id, loading);
        if (loading.mode === "upgrade") await siteUpgrade(site_id, loading);
        if (loading.mode === "run") await siteRun(site_id, loading);
      }
    } else if (conn_id) {
      editor.send(conn_id, { action: "site-loading", status: loading.status });
    }
  }
};
