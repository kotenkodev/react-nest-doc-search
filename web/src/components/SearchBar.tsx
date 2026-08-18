import { useFileUpload } from "@/hooks/useFileUpload";
import {
  SearchIcon,
  UploadIcon,
  XCircleFillIcon,
} from "@primer/octicons-react";
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
    <div className="mx-auto flex max-w-5xl flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="w-full sm:max-w-md sm:flex-1">
        <TextInput
          className="w-full!"
          block
          monospace
          type="search"
          trailingVisual={
            searchText ? (
              <IconButton
                variant="invisible"
                icon={XCircleFillIcon}
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
              />
            ) : (
              <IconButton
                variant="invisible"
                icon={SearchIcon}
                aria-label="Search"
              />
            )
          }
          placeholder="Search documents..."
          value={searchText}
          onChange={handleSearch}
        />
      </div>

      <div className="flex w-full items-center justify-around gap-3 sm:w-auto sm:justify-end">
        <Button
          leadingVisual={UploadIcon}
          loading={isUploading}
          onClick={openFileDialog}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>

        <Card padding="condensed">
          <Text className="flex items-center align-center gap-1 text-sm">
            Found
            {isLoading ? (
              <Spinner size="small" />
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
            document{total === 1 ? "" : "s"}
          </Text>
        </Card>
      </div>
    </div>
  );
}
