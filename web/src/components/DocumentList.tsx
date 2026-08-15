import { BookIcon, DownloadIcon, TrashIcon } from "@primer/octicons-react";
import { IconButton, Label, RelativeTime } from "@primer/react";
import { Blankslate, Card, DataTable, Table } from "@primer/react/experimental";
import SkeletonList from "./SkeletonList";
import {
  useDeleteDocumentMutation,
  useDocumentsQuery,
} from "@/hooks/useDocuments";
import { type DocumentItem } from "@/types/document.type";

const stateColorMap: Record<DocumentItem["status"], string> = {
  pending: "attention",
  success: "success",
  error: "danger",
};

export default function FilesList() {
  const { data, isLoading } = useDocumentsQuery();
  const { mutate: deleteDocument } = useDeleteDocumentMutation();

  const handleDelete = (id: string) => {
    deleteDocument(id);
  };

  if (isLoading) {
    return <SkeletonList />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="mt-5! mx-auto max-w-2xl">
        <Blankslate>
          <Blankslate.Visual>
            <BookIcon size="medium" />
          </Blankslate.Visual>
          <Blankslate.Heading>No documents found</Blankslate.Heading>
          <Blankslate.Description>
            Try adjusting your search query or upload some documents to get
            started.
          </Blankslate.Description>
          <Blankslate.PrimaryAction onClick={() => alert("click")}>
            Upload documents
          </Blankslate.PrimaryAction>
        </Blankslate>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Table.Container>
        <Table.Title as="h3" id="files-list-title">
          Documents
        </Table.Title>
        <DataTable
          aria-labelledby="files-list-title"
          data={data}
          columns={[
            {
              header: "Name",
              field: "userFilename",
              rowHeader: true,
            },
            {
              header: "Highlight",
              field: "highlight",
              renderCell: (row) => {
                if (!row.highlight) {
                  return (
                    <span className="text-gray-500 italic">No highlight</span>
                  );
                }
                return (
                  <div
                    className="text-sm max-w-md truncate [&>em]:bg-yellow-200 [&>em]:text-black [&>em]:not-italic [&>em]:font-bold"
                    dangerouslySetInnerHTML={{ __html: row.highlight }}
                  />
                );
              },
            },
            {
              header: "Status",
              field: "status",
              renderCell: (row) => {
                return (
                  <Label variant={stateColorMap[row.status]} size="large">
                    {row.status}
                  </Label>
                );
              },
            },
            {
              header: "Added",
              field: "uploadedAt",
              renderCell: (row) => {
                return <RelativeTime date={new Date(row.uploadedAt)} />;
              },
            },
            {
              id: "actions",
              header: () => (
                <span
                  style={{
                    clipPath: "inset(50%)",
                    height: "1px",
                    overflow: "hidden",
                    position: "absolute",
                    whiteSpace: "nowrap",
                    width: "1px",
                  }}
                >
                  Actions
                </span>
              ),
              renderCell: (row) => {
                return (
                  <>
                    <IconButton
                      aria-label={`Download: ${row.userFilename}`}
                      title={`Download: ${row.userFilename}`}
                      icon={DownloadIcon}
                      variant="invisible"
                      className="text-blue-500!"
                      onClick={() => {
                        alert(`Fake downloading ${row.userFilename}`);
                      }}
                    />
                    <IconButton
                      aria-label={`Delete: ${row.userFilename}`}
                      title={`Delete: ${row.userFilename}`}
                      icon={TrashIcon}
                      variant="invisible"
                      className="text-red-500!"
                      onClick={() => {
                        deleteDocument(row.id);
                      }}
                    />
                  </>
                );
              },
            },
          ]}
        />
      </Table.Container>
    </div>
  );
}
