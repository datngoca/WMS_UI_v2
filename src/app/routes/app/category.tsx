import { QueryClient } from "@tanstack/react-query";

import { ContentLayout } from "@/components/layouts";
import { getCategoriesQueryOptions } from "@/features/categories/api/get-categories";
import { CategoriesView } from "@/features/categories/components/categories-view/categories-view";

export const clientLoader = (queryClient: QueryClient) => async () => {
  const query = getCategoriesQueryOptions();
  return queryClient.query(query);
};

const CategoryRoute = () => {
  return (
    <ContentLayout title="Danh mục" noPadding className="flex-1 min-h-0">
      <CategoriesView />
    </ContentLayout>
  );
};
export default CategoryRoute;
