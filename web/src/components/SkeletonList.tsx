import { Pagination } from "@primer/react";
import { Table } from "@primer/react/experimental";

export default function SkeletonList() {
  return (
    <div className="mx-auto max-w-5xl pt-3 px-2">
      <Table.Container>
        <Table.Title as="h2" id="documents-loading">
          Documents
        </Table.Title>
        <Table.Skeleton
          aria-labelledby="documents-loading"
          rows={10}
          columns={[
            { width: "auto", header: "Name", id: "name" },
            {
              width: "grow",
              header: "Hightlight",
              id: "hightlight",
            },
            {
              width: "auto",
              header: "Status",
              id: "status",
            },
            {
              width: "auto",
              header: "Added",
              id: "added",
            },

            { width: "auto", header: "", id: "actions" },
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
