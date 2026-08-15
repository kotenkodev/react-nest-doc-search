import { useUploadDocumentMutation } from "@/hooks/useDocuments";
import { SearchIcon } from "@primer/octicons-react";
import {
  Button,
  CounterLabel,
  IconButton,
  Text,
  TextInput,
} from "@primer/react";
import { useRef } from "react";

export default function SearchBar() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocumentMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = "";
    }
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
      />
      {/* <Text>
        found
        <CounterLabel
          className={`text-white! ${
            1 === 0
              ? "bg-(--bgColor-danger-emphasis)!"
              : "bg-(--bgColor-success-emphasis)!"
          }`}
        >
          {1}
        </CounterLabel>
        results
      </Text> */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "Uploading..." : "Upload"}
      </Button>{" "}
    </div>
  );
}
