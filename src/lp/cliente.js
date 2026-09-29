/*
 * Script das LPs de lançamento (servido em /_lp/lp.js e injetado pelo site).
 * Mede visita, seções vistas ([data-lp-secao]), rolagem, cliques ([data-lp-cta] e links),
 * início e envio de formulários e tempo na página; envia os formulários [data-lp-form];
 * repassa as UTMs da visita para os links de checkout. Sem cookies e sem IP: visitante e
 * sessão são ids aleatórios. Em modo prévia não grava nada.
 */
(function () {
  "use strict";
  var eu = document.currentScript;
  if (!eu || !eu.dataset.lp) return;
  var LP = eu.dataset.lp;
  var PREVIA = eu.dataset.previa === "1";
  var BASE = eu.src.replace(/\/_lp\/lp\.js.*$/, "");

  function id() {
    var a = new Uint8Array(12);
    crypto.getRandomValues(a);
    return Array.prototype.map
      .call(a, function (b) {
        return ("0" + b.toString(36)).slice(-2);
      })
      .join("");
  }
  function guardado(armazem, chave, criar) {
    try {
      var v = armazem.getItem(chave);
      if (!v) {
        v = criar();
        armazem.setItem(chave, v);
      }
      return v;
    } catch (e) {
      return criar();
    }
  }
  var visitante = guardado(window.localStorage, "lp_v", id);
  var sessao = guardado(window.sessionStorage, "lp_s_" + LP, id);

  // UTMs: da URL; guardadas na sessão para os próximos eventos e para o formulário.
  var CAMPOS_UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var utm = {};
  try {
    utm = JSON.parse(sessionStorage.getItem("lp_utm_" + LP) || "{}");
  } catch (e) {}
  var params = new URLSearchParams(location.search);
  var temNova = false;
  CAMPOS_UTM.forEach(function (k) {
    var v = params.get(k);
    if (v) {
      if (!temNova) {
        utm = {};
        temNova = true;
      }
      utm[k] = v.slice(0, 100);
    }
  });
  try {
    sessionStorage.setItem("lp_utm_" + LP, JSON.stringify(utm));
  } catch (e) {}
  var origem = "";
  try {
    var r = document.referrer && new URL(document.referrer);
    if (r && r.host !== location.host) origem = r.host.replace(/^www\./, "");
  } catch (e) {}

  // Fila de eventos, enviada em lotes.
  var fila = [];
  function registrar(tipo, rotulo, valor) {
    if (PREVIA) return;
    var e = { type: tipo, visitor_id: visitante, session_id: sessao, referrer: origem };
    if (rotulo != null) e.label = String(rotulo).slice(0, 200);
    if (valor != null) e.value = valor;
    CAMPOS_UTM.forEach(function (k) {
      if (utm[k]) e[k] = utm[k];
    });
    fila.push(e);
    if (fila.length >= 20) enviar();
  }
  function enviar() {
    if (!fila.length) return;
    var corpo = JSON.stringify({ lp: LP, eventos: fila.splice(0, 30) });
    var url = BASE + "/_lp/evento";
    if (
      navigator.sendBeacon &&
      navigator.sendBeacon(url, new Blob([corpo], { type: "text/plain" }))
    )
      return;
    try {
      fetch(url, {
        method: "POST",
        body: corpo,
        keepalive: true,
        headers: { "content-type": "text/plain" },
      });
    } catch (e) {}
  }
  setInterval(enviar, 4000);

  registrar("visita", document.title);

  // Seções vistas (ordem = posição na página).
  var secoes = document.querySelectorAll("[data-lp-secao]");
  if ("IntersectionObserver" in window && secoes.length) {
    var vistas = {};
    var io = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (en) {
          if (!en.isIntersecting) return;
          var nome = en.target.getAttribute("data-lp-secao");
          if (vistas[nome]) return;
          vistas[nome] = 1;
          registrar("secao", nome, Array.prototype.indexOf.call(secoes, en.target));
          io.unobserve(en.target);
        });
      },
      { threshold: 0.35 },
    );
    secoes.forEach(function (s) {
      io.observe(s);
    });
  }

  // Rolagem: marcos de 25%.
  var marco = 0;
  function medirRolagem() {
    var h = document.documentElement.scrollHeight - innerHeight;
    var pct = h <= 0 ? 100 : Math.round((scrollY / h) * 100);
    while (marco < 100 && pct >= marco + 25) {
      marco += 25;
      registrar("rolagem", null, marco);
    }
  }
  addEventListener("scroll", medirRolagem, { passive: true });
  setTimeout(medirRolagem, 1500);

  // Tempo com a página visível.
  var visivelDesde = document.visibilityState === "visible" ? Date.now() : 0;
  var acumulado = 0;
  var tempoEnviado = false;
  function fecharTempo() {
    if (visivelDesde) {
      acumulado += Date.now() - visivelDesde;
      visivelDesde = 0;
    }
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      fecharTempo();
      if (!tempoEnviado && acumulado > 1500) {
        registrar("tempo", null, Math.round(acumulado / 1000));
        tempoEnviado = true;
      }
      enviar();
    } else {
      visivelDesde = Date.now();
    }
  });
  addEventListener("pagehide", function () {
    fecharTempo();
    if (!tempoEnviado && acumulado > 1500) {
      registrar("tempo", null, Math.round(acumulado / 1000));
      tempoEnviado = true;
    }
    enviar();
  });

  // Links externos levam as UTMs da visita (checkout, WhatsApp etc.).
  function comUtm(href) {
    try {
      var u = new URL(href, location.href);
      if (u.host === location.host || !/^https?:$/.test(u.protocol)) return href;
      CAMPOS_UTM.forEach(function (k) {
        if (utm[k] && !u.searchParams.has(k)) u.searchParams.set(k, utm[k]);
      });
      return u.toString();
    } catch (e) {
      return href;
    }
  }

  // Cliques.
  document.addEventListener(
    "click",
    function (ev) {
      var alvo =
        ev.target && ev.target.closest ? ev.target.closest("[data-lp-cta], a[href]") : null;
      if (!alvo) return;
      var nome = alvo.getAttribute("data-lp-cta");
      var href = alvo.getAttribute("href");
      if (href && alvo.tagName === "A") alvo.setAttribute("href", comUtm(alvo.href));
      if (nome) registrar("cta", nome);
      else if (href && !/^#/.test(href)) {
        try {
          var u = new URL(alvo.href, location.href);
          registrar(
            "link",
            u.host === location.host
              ? u.pathname
              : u.host.replace(/^www\./, "") + u.pathname.slice(0, 40),
          );
        } catch (e) {}
      }
      if (nome || (href && !/^#/.test(href))) enviar();
    },
    true,
  );

  // Formulários.
  function pixelLead() {
    try {
      if (window.fbq) window.fbq("track", "Lead");
    } catch (e) {}
    try {
      if (window.gtag) window.gtag("event", "generate_lead");
    } catch (e) {}
    try {
      if (window.ttq) window.ttq.track("SubmitForm");
    } catch (e) {}
  }
  document.querySelectorAll("form[data-lp-form]").forEach(function (form) {
    var nomeForm = (form.getAttribute("data-lp-form") || "formulario")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 60);
    form.setAttribute("novalidate", "");
    form.removeAttribute("action");

    // Campo-isca para robôs (invisível para pessoas e leitores de tela).
    var isca = document.createElement("input");
    isca.type = "text";
    isca.name = "_site";
    isca.tabIndex = -1;
    isca.autocomplete = "off";
    isca.setAttribute("aria-hidden", "true");
    isca.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;opacity:0";
    form.appendChild(isca);

    var iniciou = false;
    form.addEventListener("focusin", function () {
      if (!iniciou) {
        iniciou = true;
        registrar("form_inicio", nomeForm);
      }
    });

    var sucesso = form.querySelector("[data-lp-sucesso]");
    var erro = form.querySelector("[data-lp-erro]");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.hasAttribute("data-lp-enviando")) return;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (erro) erro.hidden = true;

      var campos = {};
      var dados = new FormData(form);
      dados.forEach(function (v, k) {
        if (k === "_site" || typeof v !== "string") return;
        campos[k] = campos[k] ? campos[k] + ", " + v : v;
      });
      var corpo = {
        lp: LP,
        form: nomeForm,
        nome: campos.nome || "",
        email: campos.email || "",
        whatsapp: campos.whatsapp || campos.telefone || "",
        campos: campos,
        utm: utm,
        visitor_id: visitante,
        path: location.pathname,
        referrer: origem,
        _site: isca.value,
      };

      form.setAttribute("data-lp-enviando", "");
      var concluir = function (ok) {
        form.removeAttribute("data-lp-enviando");
        if (ok) {
          registrar("form_envio", nomeForm);
          enviar();
          pixelLead();
          form.setAttribute("data-lp-enviado", "");
          if (sucesso) sucesso.hidden = false;
          form.reset();
          var destino = form.getAttribute("data-lp-redirecionar");
          if (destino && /^https:\/\//.test(destino))
            setTimeout(function () {
              location.assign(comUtm(destino));
            }, 800);
        } else if (erro) {
          erro.hidden = false;
        }
      };
      if (PREVIA) {
        setTimeout(function () {
          concluir(true);
        }, 400);
        return;
      }
      fetch(BASE + "/_lp/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(corpo),
      }).then(
        function (r) {
          concluir(r.ok);
        },
        function () {
          concluir(false);
        },
      );
    });
  });
})();
