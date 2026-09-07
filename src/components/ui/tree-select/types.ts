export type TreeNodeData = {
  name: string;
  value: string;
  children?: Array<TreeNodeData>;
};

export type TreeNodeDataState = Omit<TreeNodeData, "children"> & {
  parent?: TreeNodeDataState;
  checked?: boolean;
  hasSelectedChildren?: boolean;
  visible?: boolean;
  children?: Array<TreeNodeDataState>;
};

export type TreeSelectProps = {
  value: Array<string>;
  onValueChange: (value: Array<string>) => void;
  data: Array<TreeNodeData>;
};
