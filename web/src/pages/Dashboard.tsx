import SearchBar from "@/components/SearchBar";
import DocumentList from "@/components/DocumentList";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto py-5">
      <SearchBar />
      <DocumentList />
    </div>
  );
}
