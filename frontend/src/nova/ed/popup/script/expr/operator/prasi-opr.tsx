import { FC } from "react";
import ContentEditable from "react-contenteditable";
import { useLocal } from "utils/react/use-local";
import { EOperator, EValue } from "../lib/type";
import { operators } from "./operators";

export const POperator: FC<{ operator?: EOperator; base: EValue }> = ({
  operator,
  base,
}) => {
  const opr = operator ? operators[operator] : null;
  const local = useLocal({
    focused: false,
    value: opr?.syntax || "",
    hovered: false,
  });
  return (
    <div
      className={cx(
        "eopr",
        local.focused && "focused",
        local.hovered && "hovered",
        !local.value && "blank"
      )}
    >
      <ContentEditable
        tabIndex={0}
        className={cx("content-editable operator-content")}
        contentEditable
        spellCheck={false}
        html={local.value}
        onChange={(e) => {
          local.value = e.currentTarget.innerText;
          local.render();
        }}
        onFocus={() => {
          local.focused = true;
          local.render();
        }}
        onBlur={() => {
          local.focused = false;
          local.render();
        }}
        onPointerOut={() => {
          local.hovered = false;
          local.render();
        }}
        onPointerOver={() => {
          local.hovered = true;
          local.render();
        }}
      ></ContentEditable>
    </div>
  );
};
