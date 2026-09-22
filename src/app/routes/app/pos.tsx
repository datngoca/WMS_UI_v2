import { ContentLayout } from "@/components/layouts";
import { PosView } from "@/features/pos/components";

const PosRoute = () => {
  return (
    <ContentLayout title="Điểm bán hàng (POS)" hideTitleOnMobile noPadding>
      <PosView />
    </ContentLayout>
  );
};
export default PosRoute;

