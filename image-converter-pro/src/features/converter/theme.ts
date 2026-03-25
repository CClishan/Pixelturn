export type VisualTheme = 'classic' | 'pixel';
export type PixelScheme = 'dark' | 'light';

export function cx(...tokens: Array<string | false | null | undefined>): string {
  return tokens.filter(Boolean).join(' ');
}
