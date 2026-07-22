'use client'

import { useTextDirection } from '@/hooks/use-text-direction'

/**
 * Sélecteurs d'éléments textuels uniquement — pas les conteneurs de layout
 * (card, sidebar, dialog-content, etc.) pour éviter le miroir de l'UI.
 */
const TEXT_SELECTORS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'label',
  'legend',
  'blockquote',
  'figcaption',
  'caption',
  'input',
  'textarea',
  '[data-slot="button"]',
  '[data-slot="badge"]',
  '[data-slot="label"]',
  '[data-slot="card-title"]',
  '[data-slot="card-description"]',
  '[data-slot="dialog-title"]',
  '[data-slot="dialog-description"]',
  '[data-slot="alert-title"]',
  '[data-slot="alert-description"]',
  '[data-slot="alert-dialog-title"]',
  '[data-slot="alert-dialog-description"]',
  '[data-slot="alert-dialog-action"]',
  '[data-slot="alert-dialog-cancel"]',
  '[data-slot="sheet-title"]',
  '[data-slot="sheet-description"]',
  '[data-slot="form-label"]',
  '[data-slot="form-description"]',
  '[data-slot="form-message"]',
  '[data-slot="select-value"]',
  '[data-slot="select-item"]',
  '[data-slot="select-label"]',
  '[data-slot="dropdown-menu-item"]',
  '[data-slot="dropdown-menu-label"]',
  '[data-slot="dropdown-menu-checkbox-item"]',
  '[data-slot="dropdown-menu-radio-item"]',
  '[data-slot="tooltip-content"]',
  '[data-slot="tabs-trigger"]',
  '[data-slot="table-head"]',
  '[data-slot="table-cell"]',
  '[data-slot="table-caption"]',
  '[data-slot="sidebar-group-label"]',
  '[data-slot="sidebar-menu-button"]',
  '[data-slot="sidebar-menu-badge"]',
  '[data-slot="sidebar-menu-sub-button"]',
  '[data-slot="command-item"]',
  '[data-slot="command-empty"]',
  '[data-slot="input"]',
  '[data-slot="textarea"]',
  '[data-slot="combobox-item"]',
  '[data-slot="combobox-empty"]',
  '[data-slot="combobox-label"]',
].join(',\n  ')

/**
 * Applique la direction textuelle (via le hook) à tous les éléments de texte
 * de l'interface, sans poser `dir` sur `<html>` (qui inverserait le layout).
 */
export default function TextDirectionScope() {
  const dir = useTextDirection()

  return (
    <style>{`
  ${TEXT_SELECTORS} {
    direction: ${dir};
    unicode-bidi: isolate;
  }
`}</style>
  )
}
