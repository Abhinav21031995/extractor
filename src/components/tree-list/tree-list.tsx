import React, { useState, useEffect } from 'react';
import { CategoryNode } from '../../models/category-tree';
import { MockCategoryHierarchyData } from '../../core/mock/data/mock-category-data';
import './tree-list.css';

export interface TreeListProps {
  data?: CategoryNode[];
  heading?: string;
  showSelectAllButton?: boolean;
}

interface SelectionMap {
  [key: string]: boolean;
}

const getNodeKey = (node: CategoryNode) =>
  String(node.productID ?? node.categoryID ?? node.productName);

const TreeList = ({
  data = MockCategoryHierarchyData,
  heading = 'Select Categories',
  showSelectAllButton = true,
}: TreeListProps) => {
  // Selection and expansion state
  const [selection, setSelection] = useState({});
  const [expanded, setExpanded] = useState({});
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Expand all root nodes by default
  useEffect(() => {
    if (data) {
      const rootExpanded: SelectionMap = {};
      data.forEach((node) => {
        rootExpanded[getNodeKey(node)] = true;
      });
      setExpanded(rootExpanded);
    }
  }, [data]);

  // Helper: Recursively set selection for a node and its children
  const setNodeSelection = (
    node: CategoryNode,
    isSelected: boolean,
    map: SelectionMap = { ...selection }
  ): SelectionMap => {
    map[getNodeKey(node)] = isSelected;
    if (Array.isArray(node.categories)) {
      node.categories.forEach((child) => setNodeSelection(child, isSelected, map));
    }
    return map;
  };

  // Helper: Recursively check if all children are selected
  const isCategoryAndAllSelected = (node: CategoryNode): boolean => {
    if (!Array.isArray(node.categories) || node.categories.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return (
      !!selection[getNodeKey(node)] &&
      node.categories.every((child) => isCategoryAndAllSelected(child))
    );
  };

  // Helper: Recursively check if all lowest-level children are selected
  const isLowestCategorySelected = (node: CategoryNode): boolean => {
    if (!Array.isArray(node.categories) || node.categories.length === 0) {
      return !!selection[getNodeKey(node)];
    }
    return node.categories.every((child) => isLowestCategorySelected(child));
  };

  // Toggle selection for a single node
  const toggleSelection = (node: CategoryNode) => {
    setSelection((prev) => {
      const newMap = { ...prev };
      newMap[getNodeKey(node)] = !prev[getNodeKey(node)];
      return newMap;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newState = !isAllSelected;
    setIsAllSelected(newState);
    let newMap: SelectionMap = { ...selection };
    data.forEach((node) => {
      newMap = setNodeSelection(node, newState, newMap);
    });
    setSelection(newMap);
  };

  // Toggle lowest-level selection for a node
  const toggleLowestCategorySelection = (node: CategoryNode) => {
    if (!Array.isArray(node.categories) || node.categories.length === 0) {
      toggleSelection(node);
    } else {
      // Toggle all lowest-level children
      const newState = !isLowestCategorySelected(node);
      let newMap = { ...selection };
      const selectLowest = (n: CategoryNode) => {
        if (!Array.isArray(n.categories) || n.categories.length === 0) {
          newMap[getNodeKey(n)] = newState;
        } else {
          n.categories.forEach(selectLowest);
        }
      };
      selectLowest(node);
      setSelection(newMap);
    }
  };

  // Toggle selection for a node and all its subcategories
  const toggleAllCategorySelection = (node: CategoryNode) => {
    const newState = !isCategoryAndAllSelected(node);
    let newMap = { ...selection };
    setNodeSelection(node, newState, newMap);
    setSelection({ ...newMap });
  };

  // Toggle expand/collapse
  const toggleExpand = (node: CategoryNode) => {
    setExpanded((prev) => ({
      ...prev,
      [getNodeKey(node)]: !prev[getNodeKey(node)],
    }));
  };

  // Render tree recursively
  const renderTree = (
    nodes: CategoryNode[],
    parent: CategoryNode | null = null,
    level = 0
  ) => (
    <ul className="tree-list-ul" style={{ listStyle: 'none', paddingLeft: level === 0 ? 0 : 20 }}>
      {nodes.map((node) => {
        const hasChildren = Array.isArray(node.categories) && node.categories.length > 0;
        return (
          <li key={getNodeKey(node)}>
            <div className="tree-node">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <button className="toggle-btn" onClick={() => toggleExpand(node)}>
                  <span className="toggle-icon">{expanded[getNodeKey(node)] ? '-' : '+'}</span>
                </button>
              )}

              {/* Checkbox for Selection (not for root) */}
              {parent !== null && (
                <input
                  type="checkbox"
                  checked={!!selection[getNodeKey(node)]}
                  onChange={() => toggleSelection(node)}
                  className="tree-node-checkbox"
                />
              )}

              {/* Node Name */}
              <span className="tree-node-label">{node.productName}</span>

              {/* Select only lowest level categories */}
              {parent !== null && hasChildren && (
                <button className="lowest-btn" onClick={() => toggleLowestCategorySelection(node)}>
                  {isLowestCategorySelected(node) ? 'UnSelectLowestCategory' : 'SelectLowestCategory'}
                </button>
              )}

              {/* Select category and all subcategories */}
              {node.canSelectsubcategories && (
                <button className="all-btn" onClick={() => toggleAllCategorySelection(node)}>
                  {isCategoryAndAllSelected(node)
                    ? 'UnSelectCategoryAndAllSubcategories'
                    : 'SelectCategoryAndAllSubcategories'}
                </button>
              )}
            </div>

            {/* Children */}
            {hasChildren && expanded[getNodeKey(node)] && renderTree(node.categories, node, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="tree-list">
      {heading && <h2 className="Page-header">{heading}</h2>}
      {showSelectAllButton && (
        <div className="select-all-container">
          <span className="select-all" onClick={toggleSelectAll}>
            {isAllSelected ? 'Clear All' : 'Select All'}
          </span>
        </div>
      )}
      {renderTree(data)}
    </div>
  );
};

export default TreeList;