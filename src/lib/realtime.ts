/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';

export function joinRoom(
  roomId: string,
  onMessage: (payload: any) => void
) {
  const channel = supabase.channel(`room:${roomId}`);

  channel
    .on('broadcast', { event: 'ADD_SHAPE' }, ({ payload }) => {
      onMessage(payload);
    })
    .subscribe((status) => {
      console.log('🔌 Realtime status:', status);
    });

  return channel;
}


export function sendShape(
  channel: any,
  shape: any
) {
  channel.send({
    type: 'broadcast',
    event: 'ADD_SHAPE',
    payload: shape,
  });
}
