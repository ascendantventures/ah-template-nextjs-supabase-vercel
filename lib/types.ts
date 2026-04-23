export interface QuillEmailSignup {
  id: string;
  email: string;
  source: 'hero' | 'cta_section';
  createdAt: string;
  confirmedAt: string | null;
  metadata: Record<string, unknown>;
  ipHash: string | null;
}
