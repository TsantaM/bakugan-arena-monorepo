"use client"

/**
 * Point d'entrée client-only pour vaul.
 * Évite que le bundler serveur évalue React.createContext de vaul
 * pendant "Collecting page data" (crash Vercel sur des pages sans rapport).
 */
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "./drawer"
