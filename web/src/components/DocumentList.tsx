import { BookIcon, DownloadIcon, TrashIcon } from "@primer/octicons-react";
import {
  Details,
  IconButton,
  Label,
  type LabelColorOptions,
  RelativeTime,
  Text,
  useConfirm,
  useDetails,
} from "@primer/react";
import { Blankslate, Card, DataTable, Table } from "@primer/react/experimental";
import SkeletonList from "./SkeletonList";
import { useDeleteDocumentMutation } from "@/hooks/useDocuments";
import { useFileUpload } from "@/hooks/useFileUpload";
import { type DocumentItem } from "@/types/document.type";
import { downloadDocumentFile } from "@/services/documentService";
import { toast } from "sonner";

const stateColorMap: Record<DocumentItem["status"], LabelColorOptions> = {
  pending: "attention",
  success: "success",
  error: "danger",
};

interface FilesListProps {
  documents: DocumentItem[];
  isLoading: boolean;
  searchText?: string;
}

export default function FilesList({
  documents,
  isLoading,
  searchText,
}: FilesListProps) {
  const { mutate: deleteDocument } = useDeleteDocumentMutation();
  const { openFileDialog, isUploading } = useFileUpload();
  const confirm = useConfirm();
  const { getDetailsProps } = useDetails({ closeOnOutsideClick: true });

  const handleDelete = async (id: string, userFilename: string) => {
    const isConfirmed = await confirm({
      title: "Delete document",
      content: `Are you sure you want to delete "${userFilename}"?`,
      confirmButtonContent: "Delete",
      confirmButtonType: "danger",
    });
    if (isConfirmed) {
      deleteDocument(id);
    }
  };

  const handleDownload = async (id: string, userFilename: string) => {
    try {
      await downloadDocumentFile(id, userFilename);
      toast.success(`Downloading "${userFilename}"...`);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to download document";
      toast.error(message);
      console.error("Failed to download document", error);
    }
  };

  if (isLoading) {
    return <SkeletonList />;
  }

  if (!documents || documents.length === 0) {
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
          <Blankslate.PrimaryAction
            onClick={openFileDialog}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload documents"}
          </Blankslate.PrimaryAction>
        </Blankslate>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pt-3 px-2">
      <Table.Container>
        <Table.Title as="h3" id="files-list-title">
          Documents
        </Table.Title>
        <DataTable
          aria-labelledby="files-list-title"
          data={documents}
          columns={[
            {
              width: "auto",
              header: "Name",
              field: "userFilename",
              rowHeader: true,
            },
            {
              width: "grow",
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
                    className="text-sm max-w-lg line-clamp-2 [&>em]:bg-yellow-200 [&>em]:text-black [&>em]:not-italic [&>em]:font-bold [&>em]:px-0.5 [&>em]:py-0.2 [&>em]:rounded-xs"
                    dangerouslySetInnerHTML={{ __html: row.highlight }}
                  />
                );
              },
            },
            {
              width: "auto",
              header: "Status",
              field: "status",
              renderCell: (row) => {
                return (
                  <Details {...getDetailsProps()}>
                    <Label
                      as="summary"
                      variant={stateColorMap[row.status]}
                      size="large"
                    >
                      {row.status}
                    </Label>
                    <Text>{row.error || "No error"}</Text>
                  </Details>
                );
              },
            },
            {
              width: "auto",
              header: "Added",
              field: "uploadedAt",
              renderCell: (row) => {
                return <RelativeTime date={new Date(row.uploadedAt)} />;
              },
            },
            {
              width: "auto",
              id: "actions",
              header: () => <></>,
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
                        handleDownload(row.id, row.userFilename);
                      }}
                    />
                    <IconButton
                      aria-label={`Delete: ${row.userFilename}`}
                      title={`Delete: ${row.userFilename}`}
                      icon={TrashIcon}
                      variant="invisible"
                      className="text-red-500!"
                      onClick={() => {
                        handleDelete(row.id, row.userFilename);
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
