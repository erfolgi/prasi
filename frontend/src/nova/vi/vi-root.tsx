import { FC, Suspense, useEffect } from "react";
import { ErrorBox } from "./lib/error-box";
import { viInit } from "./lib/init-vi";
import { useVi } from "./lib/store";
import { ViProp } from "./lib/types";
import { ViPage } from "./vi-page";

export const ViRoot: FC<ViProp> = ({
  page,
  comps,
  layout,
  loader,
  enablePreload,
  db,
  api,
  mode,
  wrapper,
}) => {
  const { init, ref } = useVi(({ action, ref, state }) => ({
    init: action.init,
    state_page: state.page,
    state_comps: ref.comps,
    ref,
  }));

  if (!ref.init) {
    ref.init = true;
    ref.loader.comps = loader.comps as any;
    if (wrapper) ref.wrapper = wrapper;
    viInit({ loader, enablePreload: !!enablePreload });
  }

  init({ page, comps, layout, db, api, mode });

  return (
    <ErrorBox>
      <Suspense>
        <ViPage />
      </Suspense>
    </ErrorBox>
  );
};