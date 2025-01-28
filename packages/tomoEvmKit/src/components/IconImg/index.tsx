// biome-ignore lint/style/useImportType: type is not enough
import React from 'react';

export function IconImg({
  className,
  src,
  alt,
  ...props
}: React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>) {
  // biome-ignore lint/a11y/useAltText: no need
  return <img alt={alt || ''} src={src} {...props} className={className} />;
}
