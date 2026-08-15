import { SearchIcon } from "@primer/octicons-react";
import {
  Button,
  CounterLabel,
  IconButton,
  Text,
  TextInput,
} from "@primer/react";

export default function SearchBar() {
  const count = 0;

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-between">
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

      <Text>
        found
        <CounterLabel
          className={`text-white! ${
            count === 0
              ? "bg-(--bgColor-danger-emphasis)!"
              : "bg-(--bgColor-success-emphasis)!"
          }`}
        >
          {count}
        </CounterLabel>
        results
      </Text>
      <Button>Upload</Button>
    </div>
  );
}
