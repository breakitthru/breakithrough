/*
  Brand logo. Renders the admin-uploaded logo when one exists, otherwise the
  supplied placeholder box (so every existing "Logo" box stays exactly as it was
  until an image is uploaded). Pure/presentational so it works in both server and
  client components. The image is a data URL stored in SiteConfig.
*/
export function BrandLogo({
  logoUrl,
  logoSize,
  fallback,
  alt = "Logo",
  className,
}: {
  logoUrl?: string | null;
  logoSize?: number | null;
  fallback: React.ReactNode;
  alt?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={alt}
        style={{ height: `${logoSize ?? 40}px` }}
        className={className ?? "w-auto max-w-full object-contain"}
      />
    );
  }
  return <>{fallback}</>;
}
