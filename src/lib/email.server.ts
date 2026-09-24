/**
 * Aviso de novo lead por e-mail (Resend). Sem RESEND_API_KEY ou LEAD_NOTIFY_TO,
 * não faz nada: os leads continuam no painel.
 */
import type { LeadEntrada } from "@/lib/leads.functions";

const TIPOS: Record<string, string> = {
  contato: "Mensagem de contato",
  interesse: "Lista de interesse",
  corporativo: "Pedido de proposta corporativa",
  diagnostico: "Diagnóstico concluído",
};

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export async function avisarNovoLead(lead: Omit<LeadEntrada, "website">) {
  const chave = process.env.RESEND_API_KEY;
  const para = process.env.LEAD_NOTIFY_TO;
  const de = process.env.EMAIL_FROM;
  if (!chave || !para || !de) return;

  const tipo = TIPOS[lead.kind] ?? lead.kind;
  const linhas = [
    ["Nome", lead.name],
    ["E-mail", lead.email],
    ["WhatsApp", lead.phone],
    ["Empresa", lead.company],
    ["Assunto", lead.subject],
    ["Mensagem", lead.message],
    ["Página", lead.source_path],
  ].filter(([, v]) => v);

  const html = `<div style="font-family:system-ui,sans-serif;color:#333;max-width:560px">
<p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8A6A12;margin:0 0 8px">${esc(tipo)}</p>
<h1 style="font-family:Georgia,serif;font-weight:400;color:#003F5C;margin:0 0 20px">${esc(lead.name)}</h1>
<table style="border-collapse:collapse;width:100%">${linhas
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#5B6166;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:8px 0;white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin-top:24px;font-size:13px;color:#5B6166">Veja e responda pelo painel: https://danielbasso.com.br/admin/leads</p>
</div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: de,
      to: para.split(",").map((s) => s.trim()),
      reply_to: lead.email || undefined,
      subject: `${tipo}: ${lead.name}`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
