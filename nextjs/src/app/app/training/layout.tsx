// This layout forces all training pages to be dynamic (not statically generated)
// to avoid circular dependency issues with Supabase client during build
export const dynamic = 'force-dynamic';

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
