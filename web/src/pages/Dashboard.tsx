import SearchBar from "@/components/SearchBar";
import DocumentList from "@/components/DocumentList";
import { useDocumentsQuery } from "@/hooks/useDocuments";
import { useState } from "react";

export default function Dashboard() {
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useDocumentsQuery(searchText);

  return (
    <div className="max-w-7xl mx-auto py-5">
      <SearchBar
        searchText={searchText}
        onSearchChange={setSearchText}
        isLoading={isLoading}
        total={data?.total ?? 0}
      />
      <DocumentList documents={data?.documents ?? []} isLoading={isLoading} />
    </div>
  );
}
