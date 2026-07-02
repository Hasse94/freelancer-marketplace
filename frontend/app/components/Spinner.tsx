export default function Spinner({
  label,
  small = false,
}: {
  label?: string;
  small?: boolean;
}) {
  const size = small ? "h-4 w-4 border-2" : "h-8 w-8 border-[3px]";
  return (
    <div
      className={small ? "inline-flex items-center gap-2" : "flex flex-col items-center gap-3 py-12"}
      role="status"
      aria-live="polite"
    >
      <span
        className={`${size} animate-spin rounded-full border-emerald-500 border-t-transparent`}
      />
      {label ? (
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
