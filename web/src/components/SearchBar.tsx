import { SearchIcon } from "@primer/octicons-react";
import { IconButton, Text, TextInput } from "@primer/react";

export default function SearchBar() {
  return (
    <div className="flex">
      <TextInput
        type="search"
        trailingAction={
          <IconButton
            variant="invisible"
            icon={SearchIcon}
            aria-label="Search"
          />
        }
        placeholder="Search documents"
      />

      <Text>found 10 results</Text>
    </div>
  );
}
