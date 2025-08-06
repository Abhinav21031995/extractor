import React, { useEffect, useState } from 'react';
import TreeList from '../tree-list'; 
import { CategoryNode } from '../../models/category-tree';
import { MockCategoryHierarchyData } from '../../core/mock/data/mock-category-data';

const GenericSearch = ({ onSearchTextChanged }: { onSearchTextChanged: (text: string) => void }) => {
  return (
    <input
      type="text"
      placeholder="Search categories..."
      onChange={e => onSearchTextChanged(e.target.value)}
      style={{ marginBottom: 16, width: '100%', padding: 8 }}
    />
  );
};

interface CategoryProps {
  heading?: string;
  showSelectAllButton?: boolean;
}

const Category= (props: CategoryProps) => {
  const { heading = 'Select Categories', showSelectAllButton = true } = props;
  const [dataSource, setDataSource] = useState([] as CategoryNode[]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Simulate fetching data (replace with real service if needed)
  useEffect(() => {
    setDataSource(MockCategoryHierarchyData);
    setFilteredData(MockCategoryHierarchyData);
  }, []);

  // Search handler
  const onSearchTextChanged = (searchText: string) => {
    const query = searchText.trim().toLowerCase();
    setSearchQuery(query);

    if (query.length < 3) {
      setFilteredData([...dataSource]);
    } else {
      setFilteredData(filterNodes(dataSource, query));
    }
  };

  // Recursive filter
  const filterNodes = (nodes: CategoryNode[], query: string): CategoryNode[] => {
    return nodes
      .map((node) => {
        const isMatch = node.productName.toLowerCase().includes(query);
        const filteredChildren = Array.isArray(node.categories)
          ? filterNodes(node.categories, query)
          : [];
        return isMatch || filteredChildren.length
          ? { ...node, categories: filteredChildren }
          : null;
      })
      .filter(Boolean) as CategoryNode[];
  };

  return (
    <div>
      <GenericSearch onSearchTextChanged={onSearchTextChanged} />
      <TreeList
        data={filteredData}
        heading={heading}
        showSelectAllButton={showSelectAllButton}
      />
    </div>
  );
};

export default Category;