import { useFileUpload } from "@/hooks/useFileUpload";
import { SearchIcon } from "@primer/octicons-react";
import {
  Button,
  CounterLabel,
  IconButton,
  Spinner,
  Text,
  TextInput,
} from "@primer/react";
import { Card } from "@primer/react/experimental";

interface SearchBarProps {
  searchText: string;
  onSearchChange: (searchText: string) => void;
  total: number;
  isLoading: boolean;
}

export default function SearchBar({
  searchText,
  onSearchChange,
  total,
  isLoading,
}: SearchBarProps) {
  const { openFileDialog, isUploading } = useFileUpload();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-around">
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
        value={searchText}
        onChange={handleSearch}
      />
      <Button onClick={openFileDialog} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </Button>
      <Card padding="condensed">
        <Text className="flex items-center align-center gap-1">
          Found
          {isLoading ? (
            <Spinner className="animate-spin!" size="small" />
          ) : (
            <CounterLabel
              className={`text-white! ${
                total === 0
                  ? "bg-(--bgColor-danger-emphasis)!"
                  : "bg-(--bgColor-success-emphasis)!"
              }`}
            >
              {total}
            </CounterLabel>
          )}
          documents.
        </Text>
      </Card>
    </div>
  );
}
