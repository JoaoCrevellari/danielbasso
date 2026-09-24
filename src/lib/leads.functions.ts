/**
 * Envio público de leads (contato, interesse, proposta corporativa, diagnóstico).
 *
 * Revalida no servidor, barra robôs (campo armadilha + limite por IP) e grava pela
 * função submit_lead do banco, que valida de novo cada campo. O aviso por e-mail é
 * opcional (só com RESEND_API_KEY) e nunca derruba o envio.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const leadSchema = z
  .object({
    kind: z.enum(["contato", "interesse", "corporativo", "diagnostico"]),
    name: z.string().trim().min(2, "Informe seu nome.").max(160),
    email: z.string().trim().max(200).email("E-mail inválido.").optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    company: z.string().trim().max(160).optional(),
    message: z.string().trim().max(5000).optional(),
    subject: z.string().trim().max(200).optional(),
    item_id: z.string().uuid().optional(),
    data: z.record(z.unknown()).optional(),
    source_path: z.string().max(300).optional(),
    referrer: z.string().max(300).optional(),
    utm: z.record(z.string().max(100)).optional(),
    visitor_id: z.string().max(64).optional(),
    /** Campo armadilha: humanos não veem, robôs preenchem. */
    website: z.string().max(200).optional(),
  })
  .refine((d) => !!d.email || !!d.phone, {
    message: "Informe um e-mail ou WhatsApp.",
    path: ["email"],
  });

export type LeadEntrada = z.infer<typeof leadSchema>;

export const enviarLeadFn = createServerFn({ method: "POST" })
  .validator(leadSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const { dentroDoLimite, ipDaRequisicao } = await import("@/lib/limite.server");
    if (!(await dentroDoLimite("LIMITE_FORMULARIO", `lead:${ipDaRequisicao()}`))) {
      throw new Error("Muitos envios em pouco tempo. Aguarde um minuto e tente de novo.");
    }
    if (data.website) return { ok: true };

    const { website: _armadilha, ...lead } = data;
    const { supabasePublic } = await import("@/integrations/supabase/client.server");
    const { error } = await supabasePublic.rpc("submit_lead", {
      p: { ...lead, email: lead.email || null, phone: lead.phone || null } as never,
    });
    if (error) {
      console.error("[lead] falha ao gravar:", error);
      throw new Error("Não foi possível enviar agora. Tente de novo em instantes.");
    }

    try {
      const { avisarNovoLead } = await import("@/lib/email.server");
      await avisarNovoLead(lead);
    } catch (err) {
      console.error("[lead] aviso por e-mail falhou:", err);
    }
    return { ok: true };
  });
