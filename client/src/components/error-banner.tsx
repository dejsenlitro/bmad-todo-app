interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="bg-error-bg border border-red-200 text-error rounded-lg px-4 py-3 flex items-center gap-2 text-sm motion-safe:animate-[fadeIn_200ms_ease-out]"
    >
      <span aria-hidden="true">⚠</span>
      <span>{message}</span>
    </div>
  );
}
