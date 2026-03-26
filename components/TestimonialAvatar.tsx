import { testimonialInitials } from "@/lib/testimonial-avatar";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-10 w-10 min-h-10 min-w-10 text-xs",
  md: "h-12 w-12 min-h-12 min-w-12 text-sm",
  lg: "h-16 w-16 min-h-16 min-w-16 text-base",
};

type TestimonialAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function TestimonialAvatar({
  name,
  avatarUrl,
  size = "md",
  className,
}: TestimonialAvatarProps) {
  const trimmed = avatarUrl?.trim();
  const hasUrl = Boolean(trimmed);

  if (hasUrl && trimmed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL dari admin (Cloudinary / eksternal)
      <img
        src={trimmed}
        alt=""
        className={cn(
          "shrink-0 rounded-full border-2 border-amber-200 object-cover shadow-sm",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  const initials = testimonialInitials(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-amber-200 bg-gradient-to-br from-amber-400 to-amber-600 font-bold text-white shadow-sm",
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
