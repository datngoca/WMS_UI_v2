import { Spinner } from "@/components/ui/spinner";
import { useUnits } from "@/features/units/api/get-units";
import { Table } from "@/components/ui/table";
import { paths } from "@/config/paths";
import { useSearchParams } from "react-router-dom";
import { UpdateUnit } from "./update-unit";
import { DeleteUnit } from "./delete-unit";

export const UnitsList = () => {
  const [searchParams] = useSearchParams();
  const page = +(searchParams.get("page") || 1);
  const unitsQuery = useUnits({ page, size: 5 });
  if (unitsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const units = unitsQuery.data?.data;
  const meta = unitsQuery.data?.meta;

  if (!units) return null;

  return (
    <Table
      data={units}
      columns={[
        {
          title: "Name",
          field: "name",
        },
        {
          title: "Code",
          field: "code",
        },
        {
          title: "Description",
          field: "description",
        },
        {
          title: "Actions",
          field: "id",
          Cell({ entry: { id } }) {
            return (
              <div className="flex gap-2">
                <UpdateUnit unitId={id} />
                <DeleteUnit unitId={id} />
              </div>
            );
          },
        },
      ]}
      pagination={
        meta && {
          totalPages: Math.ceil(meta.total / meta.size),
          currentPage: meta.page,
          rootUrl: paths.app.unit.getHref(),
        }
      }
    />
  );
};
