// biome-ignore lint/style/useImportType: type is not enough
import React from 'react';

export function IconImg({
  className,
  src,
  alt,
  theme,
  ...props
}: React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & { theme?: 'light' | 'dark' }) {
  // biome-ignore lint/a11y/useAltText: no need
  return (
    <img
      alt={alt || ''}
      src={src}
      {...props}
      className={className}
      style={
        theme === 'dark'
          ? {
              filter: 'invert(100%)',
            }
          : {}
      }
    />
  );
}
