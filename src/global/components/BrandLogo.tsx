import type { ImgHTMLAttributes } from 'react'
import wordmarkWithBg from '@/assets/branding/huellitas-wordmark-with-bg.png'
import wordmarkTransparent from '@/assets/branding/huellitas-wordmark-transparent.png'
import principalWithBg from '@/assets/branding/huellitas-logo-principal-with-bg.png'
import principalTransparent from '@/assets/branding/huellitas-logo-principal-transparent.png'

export type BrandLogoVariant = 'transparent' | 'with-bg'
export type BrandLogoMark = 'wordmark' | 'principal'

type BrandLogoProps = {
  mark?: BrandLogoMark
  variant?: BrandLogoVariant
  alt?: string
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>

const sources: Record<BrandLogoMark, Record<BrandLogoVariant, string>> = {
  wordmark: {
    transparent: wordmarkTransparent,
    'with-bg': wordmarkWithBg,
  },
  principal: {
    transparent: principalTransparent,
    'with-bg': principalWithBg,
  },
}

/** Logos Huellitas: emblema circular (`principal`) o wordmark (`wordmark`). */
export function BrandLogo({
  mark = 'principal',
  variant = 'transparent',
  alt = 'Huellitas',
  className,
  ...rest
}: BrandLogoProps) {
  return (
    <img
      src={sources[mark][variant]}
      alt={alt}
      className={className}
      decoding="async"
      {...rest}
    />
  )
}
