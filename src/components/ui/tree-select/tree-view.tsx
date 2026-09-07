import * as React from "react";
import { TreeNode } from "./tree-node";
import { useTreeSelect } from "./tree-stores";
import {
  getValuesFromState,
  handleNodeCheck,
  makeTreeNodeDataState,
} from "./tree-utils";
import type { TreeNodeDataState, TreeSelectProps } from "./types";

type TreeViewProps = TreeSelectProps & {
  searchValue?: string;
};

export const TreeView = ({
  value,
  onValueChange,
  data,
  searchValue,
}: TreeViewProps) => {
  const dataState = makeTreeNodeDataState(data, value, searchValue);
  const setOnCheck = useTreeSelect((state) => state.setOnCheck);

  const handleCheck = React.useCallback(
    (node: TreeNodeDataState) => {
      const updatedState = handleNodeCheck(dataState, node);
      const values = getValuesFromState(updatedState);
      onValueChange(values);
    },
    [dataState, onValueChange],
  );

  React.useEffect(() => {
    setOnCheck(handleCheck);
  }, [handleCheck, setOnCheck]);

  return (
    <div className="flex flex-col gap-2">
      {dataState.map((item) => {
        if (!item.visible) return null;

        return <TreeNode key={item.value} data={item} />;
      })}
    </div>
  );
};