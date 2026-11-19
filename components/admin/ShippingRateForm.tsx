"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  shippingRateInputSchema,
  type ShippingRateInput,
} from "@/lib/schemas/shop";

interface IShippingRateFormProps {
  defaultValues?: Partial<ShippingRateInput>;
  onSubmit: (data: ShippingRateInput) => void | Promise<void>;
  submitLabel?: string;
}

export function ShippingRateForm({
  defaultValues,
  onSubmit,
  submitLabel = "Simpan",
}: IShippingRateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingRateInput>({
    resolver: zodResolver(shippingRateInputSchema),
    defaultValues: {
      province: "",
      fee: 0,
      estimatedDays: "",
      isActive: true,
      ...defaultValues,
    },
  });

  const submit: SubmitHandler<ShippingRateInput> = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="province">Provinsi</label>
        <Input id="province" {...register("province")} aria-invalid={!!errors.province} />
        {errors.province ? <p className="text-xs text-destructive">{errors.province.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="fee">Tarif (Rp)</label>
        <Input
          id="fee"
          type="number"
          inputMode="numeric"
          {...register("fee", { valueAsNumber: true })}
          aria-invalid={!!errors.fee}
        />
        {errors.fee ? <p className="text-xs text-destructive">{errors.fee.message}</p> : null}
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="estimatedDays">Estimasi (mis. &quot;2-3 hari&quot;)</label>
        <Input id="estimatedDays" {...register("estimatedDays")} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} />
        Aktif
      </label>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
