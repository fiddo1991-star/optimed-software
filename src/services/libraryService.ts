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
    .select('content')
    .eq('clinic_id', clinicId)
    .eq('category', category)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching library items for ${category}:`, error);
    return [];
  }

  return (data?.content || []) as T[];
}

export async function saveLibraryItems<T>(clinicId: string, category: LibraryCategory, items: T[]): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert({
      clinic_id: clinicId,
      category,
      content: items,
      title: category
    }, {
      onConflict: 'clinic_id,category'
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
        filter: `clinic_id=eq.${clinicId}`
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
