type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-3xl"
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const Avatar = ({
  name,
  imageUrl,
  size = "md",
  className = ""
}: AvatarProps) => {
  const initials = getInitials(name);

  if (imageUrl) {
    return (
      <img
        alt={`${name} profile`}
        className={`rounded-2xl object-cover shadow-soft ${sizeClasses[size]} ${className}`.trim()}
        src={imageUrl}
      />
    );
  }

  return (
    <div
      aria-label={`${name} avatar`}
      className={`flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#1e3a8a,_#3b82f6)] font-semibold text-white shadow-soft ${sizeClasses[size]} ${className}`.trim()}
    >
      {initials}
    </div>
  );
};
