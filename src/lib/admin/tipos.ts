import type { Json } from "@/integrations/supabase/types";

/** Objeto JSON serializável (o que as server functions podem devolver no lugar de Record<string, unknown>). */
export type Dados = { [k: string]: Json | undefined };
