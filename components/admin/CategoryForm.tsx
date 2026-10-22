"use client";

import { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryInputSchema, type CategoryInput } from "@/lib/schemas/shop";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface ICategoryFormProps {
  defaultValues?: Partial<CategoryInput>;
  onSubmit: (data: CategoryInput) => void | Promise<void>;
  submitLabel?: string;
}

export function CategoryForm({
  defaultValues,
  onSubmit,
  submitLabel = "Simpan",
}: ICategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: {
      slug: "",
      name: "",
      description: "",
      displayOrder: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  const slugManuallyEditedRef = useRef(Boolean(defaultValues?.slug));

  // eslint-disable-next-line react-hooks/refs -- ref accessed in user-event handler, not render
  const slugReg = register("slug", {
    onChange: () => {
      slugManuallyEditedRef.current = true;
    },
  });
  // eslint-disable-next-line react-hooks/refs -- ref accessed in user-event handler, not render
  const nameReg = register("name", {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!slugManuallyEditedRef.current) {
        setValue("slug", slugify(e.target.value), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
  });

  const submit: SubmitHandler<CategoryInput> = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="name">Nama Kategori</label>
        <Input id="name" {...nameReg} aria-invalid={!!errors.name} />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="slug">Slug (URL)</label>
        <Input id="slug" {...slugReg} aria-invalid={!!errors.slug} />
        {errors.slug ? <p className="text-xs text-destructive">{errors.slug.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="description">Deskripsi</label>
        <Input id="description" {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium" htmlFor="displayOrder">Urutan</label>
          <Input
            id="displayOrder"
            type="number"
            {...register("displayOrder", { valueAsNumber: true })}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isActive")} />
            Aktif
          </label>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
