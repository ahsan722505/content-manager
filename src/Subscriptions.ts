import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const channel = client.channel("clipboard");
channel
  .on(
    "broadcast",
    { event: "clipboard-updated" },
    async ({ payload }: { payload: { content: string } }) => {
      window.electronAPI.syncRemoteClipboard(payload.content);
    }
  )
  .subscribe();
