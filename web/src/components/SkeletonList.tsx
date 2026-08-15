import { Pagination } from "@primer/react";
import { Table } from "@primer/react/experimental";

export default function SkeletonList() {
  return (
    <div className="mx-auto max-w-6xl">
      <Table.Container>
        <Table.Title as="h2" id="documents-loading">
          Documents
        </Table.Title>
        <Table.Skeleton
          aria-labelledby="documents-loading"
          rows={10}
          columns={[
            {
              header: "Name",
              id: "name",
            },
            {
              header: "Highlight",
              id: "highlight",
            },
            {
              header: "Status",
              id: "status",
            },
            {
              header: "Added",
              id: "added",
            },
            {
              header: "",
              id: "actions",
            },
          ]}
        />
      </Table.Container>
      <Pagination
        pageCount={1}
        currentPage={1}
        onPageChange={(_event, number) => {
          console.log(number);
        }}
        showPages
      />
    </div>
  );
}
