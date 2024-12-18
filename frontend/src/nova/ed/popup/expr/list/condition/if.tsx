import { inferType } from "popup/expr/lib/infer-type";
import { evalExpr } from "../../lib/eval";
import { ExprGroup } from "../../lib/group";
import { defineExpression } from "../../lib/types";
import { ExprPartsField } from "../../parts/expr-parts-field";
import { ExprPartsKind } from "../../parts/expr-parts-kind";

export default defineExpression({
  name: "if",
  label: "IF … THEN …",
  group: ExprGroup.Condition,
  desc: "",
  output_type: "any",
  fields: {
    condition: { kind: "expression", label: "Condition" },
    then: { kind: "expression", label: "Result" },
    else_if: {
      label: "Result",
      kind: "expression",
      only_expr: ["if"],
      optional: true,
      multiple: true,
    },
    else: { kind: "expression", optional: true, label: "Result" },
  },
  infer(arg) {
    const result = inferType({ ...arg, expr: arg.current.expr.then });

    if (!result.find((e) => e.simple === "null")) {
      result.push({ simple: "null", type: "null" });
    }
    return result;
  },
  evaluate(current) {
    const condition = evalExpr(current.expr.condition);

    if (!condition.value) {
      return evalExpr(current.expr.then);
    }

    return { value: null, type: "null" };
  },
  Component({ value, expected_type, onChange, onFocusChange }) {
    const { name, expr } = value;
    return (
      <>
        <ExprPartsKind
          name={name}
          label="IF"
          value={value}
          expected_type={expected_type}
          onChange={onChange}
          onFocusChange={onFocusChange}
        />
        <ExprPartsField
          name="condition"
          value={value}
          def={this}
          expected_type={["boolean"]}
          onChange={onChange}
        />

        {value.expr?.condition?.kind !== "expr" && (
          <span className="text-green-700">IS TRUE </span>
        )}

        <span>THEN</span>
        <ExprPartsField
          name="then"
          value={value}
          def={this}
          onChange={onChange}
        />
      </>
    );
  },
});
