// Tell TypeScript to allow CSS file imports as side-effects
// This is needed for Next.js global CSS imports in layout files
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
