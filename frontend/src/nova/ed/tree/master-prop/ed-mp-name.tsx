import { EDGlobal } from "logic/ed-global";
import { FC } from "react";
import { useGlobal } from "utils/react/use-global";
import { FNCompDef } from "utils/types/meta-fn";
import { EdMasterPropDetail } from "./ed-mp-detail";

export const EdMasterPropName: FC<{
  name: string;
  prop: FNCompDef;
}> = ({ name, prop }) => {
  const p = useGlobal(EDGlobal, "EDITOR");
  const is_active = p.ui.tree.comp.active === name;
  const content = (
    <div
      className={cx(
        "flex-1 p-1 cursor-pointer",
        is_active ? "bg-blue-500 text-white" : "hover:bg-blue-50"
      )}
      onClick={() => {
        p.ui.tree.comp.active = name;
        p.render();
      }}
    >
      {prop.label || name}
    </div>
  );

  if (is_active) {
    return (
      <EdMasterPropDetail
        onClose={() => {
          p.ui.tree.comp.active = "";
          p.render();
        }}
        children={content}
      />
    );
  }
  return content;
};