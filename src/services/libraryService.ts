/**
 * libraryService.ts
 * Manages shared clinic libraries (medicines, symptoms, templates, etc.)
 */

import { supabase } from '../lib/supabaseClient';

const TABLE_NAME = 'libraries';

export type LibraryCategory = 
  | 'medicines' 
  | 'symptoms' 
  | 'pmh' 
  | 'labs' 
  | 'imaging' 
  | 'followups' 
  | 'instructions' 
  | 'icdcodes' 
  | 'prescriptionTemplates' 
  | 'instructionTemplates';

export async function getLibraryItems<T>(clinicId: string, category: LibraryCategory): Promise<T[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('items')
    .eq('clinicId', clinicId)
    .eq('category', category)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching library items for ${category}:`, error);
    return [];
  }

  return (data?.items || []) as T[];
}

export async function saveLibraryItems<T>(clinicId: string, category: LibraryCategory, items: T[]): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert({
      clinicId,
      category,
      items,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clinicId,category'
    });

  if (error) {
    console.error(`Error saving library items for ${category}:`, error);
    throw error;
  }
}

// ─── Real-time listener for libraries ──────────────────────────────────────────
export function subscribeToLibrary(
  clinicId: string,
  category: LibraryCategory,
  onChange: (items: any[]) => void
): () => void {
  // Initial load
  getLibraryItems(clinicId, category).then(onChange);

  // Subscribe to changes
  const channel = supabase
    .channel(`library_${category}_${clinicId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `clinicId=eq.${clinicId}`
      },
      (payload: any) => {
        if (payload.new && payload.new.category === category) {
          onChange(payload.new.items || []);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
