"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  guestCheckoutSchema,
  type GuestCheckoutInput,
} from "@/lib/schemas/shop";

interface IAddressFormProps {
  defaultValues?: Partial<GuestCheckoutInput>;
  provinces: string[];
  showEmail?: boolean;
  submitLabel?: string;
  onSubmit: (data: GuestCheckoutInput) => void | Promise<void>;
}

export function AddressForm({
  defaultValues,
  provinces,
  showEmail = true,
  submitLabel = "Lanjutkan",
  onSubmit,
}: IAddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<GuestCheckoutInput>({
    resolver: zodResolver(guestCheckoutSchema),
    defaultValues: {
      email: "",
      recipientName: "",
      phone: "",
      addressLine: "",
      kelurahan: "",
      kecamatan: "",
      city: "",
      province: "",
      postalCode: "",
      ...defaultValues,
    },
  });

  const provinceValue = watch("province");

  const submit: SubmitHandler<GuestCheckoutInput> = async (data) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {showEmail ? (
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="recipientName">Nama Penerima</label>
          <Input id="recipientName" {...register("recipientName")} aria-invalid={!!errors.recipientName} />
          {errors.recipientName ? <p className="text-xs text-destructive">{errors.recipientName.message}</p> : null}
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="phone">No. HP</label>
          <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} placeholder="08xxxxxxxxxx" />
          {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="addressLine">Alamat lengkap</label>
        <Input id="addressLine" {...register("addressLine")} aria-invalid={!!errors.addressLine} />
        {errors.addressLine ? <p className="text-xs text-destructive">{errors.addressLine.message}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="rtRw">RT/RW (opsional)</label>
          <Input id="rtRw" {...register("rtRw")} placeholder="001/002" />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="postalCode">Kode Pos</label>
          <Input id="postalCode" {...register("postalCode")} aria-invalid={!!errors.postalCode} />
          {errors.postalCode ? <p className="text-xs text-destructive">{errors.postalCode.message}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="kelurahan">Kelurahan</label>
          <Input id="kelurahan" {...register("kelurahan")} aria-invalid={!!errors.kelurahan} />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="kecamatan">Kecamatan</label>
          <Input id="kecamatan" {...register("kecamatan")} aria-invalid={!!errors.kecamatan} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium" htmlFor="city">Kota/Kabupaten</label>
          <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
        </div>
        <div>
          <label className="text-sm font-medium">Provinsi</label>
          <Select
            value={provinceValue || undefined}
            onValueChange={(v) => setValue("province", v, { shouldValidate: true })}
          >
            <SelectTrigger aria-label="Provinsi">
              <SelectValue placeholder="Pilih provinsi" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.province ? <p className="text-xs text-destructive">{errors.province.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="notes">Catatan (opsional)</label>
        <Input id="notes" {...register("notes")} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Memproses..." : submitLabel}
      </Button>
    </form>
  );
}
