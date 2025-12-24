import { supabase } from './supabase';
import { Shape } from '@/types/shapes';

export async function saveDrawing(
  roomId: string,
  shapes: Shape[]
) {
  const { error } = await supabase
    .from('drawings')
    .upsert(
      {
        room_id: roomId,
        shapes,
      },
      {
        onConflict: 'room_id', // ✅ THIS IS REQUIRED
      }
    );

  if (error) {
    console.error('Save drawing error:', error);
    throw error;
  }
}


export async function loadDrawing(
  roomId: string
): Promise<Shape[] | null> {
  const { data, error } = await supabase
    .from('drawings')
    .select('shapes')
    .eq('room_id', roomId)
    .maybeSingle();

  if (error) {
    console.error('Load drawing error:', error);
    return null;
  }

  return data?.shapes ?? null;
}
