import SearchBar from "@/components/SearchBar";
import DocumentList from "@/components/DocumentList";
import { useDocumentsQuery } from "@/hooks/useDocuments";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocumentSse } from "@/hooks/useDocumentSse";
import { useState } from "react";

export default function Dashboard() {
  useDocumentSse();

  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 300);
  const isDebouncing = searchText !== debouncedSearchText;
  const { data, isLoading, isFetching } =
    useDocumentsQuery(debouncedSearchText);

  return (
    <div className="max-w-7xl mx-auto py-5">
      <SearchBar
        searchText={searchText}
        onSearchChange={setSearchText}
        isLoading={isLoading || isFetching || isDebouncing}
        total={data?.total ?? 0}
      />
      <DocumentList
        documents={data?.documents ?? []}
        isLoading={isLoading}
        searchText={debouncedSearchText}
      />
    </div>
  );
}
