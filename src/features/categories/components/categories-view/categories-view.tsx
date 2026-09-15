import { Spinner } from "@/components/ui/spinner";
import { useCategories } from "../../api/get-categories";

import { CategoriesListTree } from "./categories-left";

export const CategoriesView = () => {
  const categoriesQuery = useCategories({});

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const categories = categoriesQuery.data?.data;

  if (!categories) return null;

  return <div className="h-full min-h-0">
    <CategoriesListTree data={categories}/>
  </div>;
};
