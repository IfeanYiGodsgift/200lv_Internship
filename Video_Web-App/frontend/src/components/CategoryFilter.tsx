import React from "react";
import styled from "styled-components";

// Define a type for the props
interface FilterButtonProps {
  active: boolean;
}

// Styled-component for the container holding the filter buttons
const FilterContainer = styled.div`
  margin: 10px 0;
`;

// Styled-component for individual filter buttons
const FilterButton = styled.button<FilterButtonProps>`
  margin: 0 5px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: ${(props) =>
    props.active ? "#007bff" : "#ccc"}; // Different background color if active
  color: ${(props) =>
    props.active ? "#fff" : "#000"}; // Different text color if active
  border: none;
  border-radius: 5px;
`;

// Props for the CategoryFilter component
interface CategoryFilterProps {
  categories: string[]; // Array of category names
  selectedCategory: string | null; // Currently selected category
  onCategoryChange: (category: string | null) => void; // Function to call when a category is selected
}

// Functional component for rendering category filter buttons
const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  // Remove duplicates from the categories array
  const uniqueCategories = Array.from(new Set(categories));

  return (
    <FilterContainer>
      {/* Button to show all videos */}
      <FilterButton
        onClick={() => onCategoryChange(null)}
        active={selectedCategory === null}
      >
        All
      </FilterButton>
      {/* Buttons for each unique category */}
      {uniqueCategories.map((category) => (
        <FilterButton
          key={category}
          onClick={() => onCategoryChange(category)}
          active={selectedCategory === category}
        >
          {category}
        </FilterButton>
      ))}
    </FilterContainer>
  );
};

export default CategoryFilter;
