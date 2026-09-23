import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import type { LucideIcon } from "lucide-react";

import type { CreateProductInput } from "../../api/create-product";
import type { transformCategoriesToTreeData } from "@/features/categories/utils/category-tree";

export type TabKey = "general" | "units" | "specs" | "options";

export type TabItem = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  count?: number;
  hasError: boolean;
};

export type FormTabBaseProps = {
  control: Control<CreateProductInput>;
  register: UseFormRegister<CreateProductInput>;
  errors: FieldErrors<CreateProductInput>;
  onOpenScanner?: (fieldName: string, label: string) => void;
};

export type GeneralTabProps = FormTabBaseProps & {
  setValue: UseFormSetValue<CreateProductInput>;
  watch: UseFormWatch<CreateProductInput>;
  categoriesTreeData: ReturnType<typeof transformCategoriesToTreeData>;
  isScrapingLotte?: boolean;
  galleryImages?: string[];
  setGalleryImages?: React.Dispatch<React.SetStateAction<string[]>>;
};

export type UnitsTabProps = FormTabBaseProps & {
  unitOptions: Array<{ label: string; value: string }>;
};

export type SpecsTabProps = FormTabBaseProps;

export type OptionsTabProps = FormTabBaseProps;
