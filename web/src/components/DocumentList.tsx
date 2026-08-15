import { BookIcon, DownloadIcon, TrashIcon } from "@primer/octicons-react";
import { IconButton, Pagination, RelativeTime } from "@primer/react";
import { Blankslate, Card, DataTable, Table } from "@primer/react/experimental";
import React from "react";
import SkeletonList from "./SkeletonList";

interface FileItem {
  id: string;
  status: string;
  storageFilename: string;
  userFilename: string;
  highlight?: string;
  uploadedAt: string;
}

const dummyFiles: FileItem[] = [
  {
    id: "1",
    status: "COMPLETED",
    storageFilename: "123-abc-doc.pdf",
    userFilename: "Q3_Financial_Report.pdf",
    highlight:
      "The company saw an increase in <em>revenue</em> during the third quarter.",
    uploadedAt: new Date(Date.now() - 1000000).toISOString(),
  },
  {
    id: "2",
    status: "PROCESSING",
    storageFilename: "456-def-doc.docx",
    userFilename: "Project_Proposal_Draft.docx",
    highlight:
      "This <em>proposal</em> outlines the new architecture for the doc search.",
    uploadedAt: new Date(Date.now() - 5000000).toISOString(),
  },
  {
    id: "3",
    status: "FAILED",
    storageFilename: "789-ghi-doc.txt",
    userFilename: "Meeting_Notes.txt",
    uploadedAt: new Date(Date.now() - 15000000).toISOString(),
  },
];

export default function FilesList() {
  const [currentPage, setCurrentPage] = React.useState(2);
  const [loading, setLoading] = React.useState(false);

  if (loading) {
    return <SkeletonList />;
  }

  if (!dummyFiles) {
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
          data={dummyFiles}
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
                        alert(`Fake deleting ${row.userFilename}`);
                      }}
                    />
                  </>
                );
              },
            },
          ]}
        />
      </Table.Container>
      <Pagination
        pageCount={10}
        currentPage={currentPage}
        onPageChange={(_event, number) => {
          setCurrentPage(number);
        }}
        showPages
      />
    </div>
  );
}
