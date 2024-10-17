// src/components/SearchBar.tsx
import React from "react";
import styled from "styled-components";

const SearchBarWrapper = styled.div`
  margin: 20px 0;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  width: 200px; // Adjust this value to set the desired width
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
`;

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <SearchBarWrapper>
      <SearchInput
        type="text"
        placeholder="Search videos..."
        value={value}
        onChange={onChange}
      />
    </SearchBarWrapper>
  );
};

export default SearchBar;
