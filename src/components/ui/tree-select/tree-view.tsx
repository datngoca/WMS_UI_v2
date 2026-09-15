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
  value = [],
  onValueChange,
  data,
  searchValue,
  multiple = true,
}: TreeViewProps) => {
  const safeValue = Array.isArray(value) ? value : [];
  const dataState = React.useMemo(
    () => makeTreeNodeDataState(data, safeValue, searchValue, multiple),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, JSON.stringify(safeValue), searchValue, multiple],
  );
  const setOnCheck = useTreeSelect((state) => state.setOnCheck);

  const handleCheck = React.useCallback(
    (node: TreeNodeDataState) => {
      if (!multiple) {
        // Single select mode: selecting a node sets only this exact node
        if (safeValue.includes(node.value)) {
          onValueChange([]);
        } else {
          onValueChange([node.value]);
        }
        return;
      }

      // Multiple select mode
      const updatedState = handleNodeCheck(dataState, node);
      const values = getValuesFromState(updatedState);
      onValueChange(values);
    },
    [multiple, safeValue, dataState, onValueChange],
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