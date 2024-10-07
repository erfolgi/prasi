import { FC, ReactElement } from "react";
import { EdPickerRename } from "../picker/picker-rename";

export type EType = ESimpleType | EArrayType | EObjectType;
export type ESimpleType = "string" | "number" | "boolean" | "null";
export type EBaseType = ESimpleType | "array" | "object";
export type EArrayType = [EType];
export type EObjectType = {
  [K in string]: EObjectEntry;
};
export type EObjectEntry = { type: EType; idx: number; optional?: boolean };

export type EValue<T extends EType> = { value: any; type: T; valid?: boolean };

export type EVChildren = (arg: {
  open: () => void;
  type: EType;
  Item: FC<{ children: any; className?: string }>;
  Lines: FC<{ className?: string }>;
  depth: number;
  name?: string;
  Rename: typeof EdPickerRename;
  path: string[];
}) => ReactElement;