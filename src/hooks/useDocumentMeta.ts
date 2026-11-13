import { useEffect } from 'react';
import { TAB_SEO_METADATA } from '../data/seo';
import type { SeoTabId } from '../data/seo';

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export function useDocumentMeta(activeTab: SeoTabId): void {
  useEffect(() => {
    const meta = TAB_SEO_METADATA[activeTab] || TAB_SEO_METADATA.galeria;
    const basePageUrl = window.location.href.split('#')[0];
    const canonicalUrl =
      window.location.hash && activeTab !== 'galeria'
        ? `${basePageUrl}#${activeTab}`
        : basePageUrl;
    const ogImageUrl = new URL('./og-cover.jpg', basePageUrl).href;

    document.title = meta.title;
    upsertMetaTag('name', 'description', meta.description);
    upsertMetaTag('name', 'keywords', meta.keywords);

    upsertMetaTag('property', 'og:title', meta.ogTitle);
    upsertMetaTag('property', 'og:description', meta.ogDescription);
    upsertMetaTag('property', 'og:url', canonicalUrl);
    upsertMetaTag('property', 'og:image', ogImageUrl);

    upsertMetaTag('name', 'twitter:title', meta.ogTitle);
    upsertMetaTag('name', 'twitter:description', meta.ogDescription);
    upsertMetaTag('name', 'twitter:image', ogImageUrl);

    upsertCanonicalLink(canonicalUrl);
  }, [activeTab]);
}
