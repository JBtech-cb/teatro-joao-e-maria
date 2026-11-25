/* ============================================================
   PAINEL DO TEATRO — João e Maria
   Controlador (senha) + atores + som + cenário + cortina + diretor
   Sincronização ao vivo por MQTT (sem conta, sem servidor próprio).
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- utilidades ---------------- */
  var CH_MESTRE = 'teatro_mestre_v1';
  var CH_CUE = 'teatro_cue_v1';
  var CH_QTD = 'teatro_qtd_v1';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function total() { return CUES.length; }
  function limitar(n) { n = Math.floor(Number(n)); if (isNaN(n)) n = 0; return Math.max(0, Math.min(n, total() - 1)); }
  function topico(sub) { return 'teatrocue/' + CONFIG.sala + '/' + sub; }

  /* ---------------- estado ---------------- */
  var estado = {
    cue: limitar(localStorage.getItem(CH_CUE) || 0),
    aba: 'agora',
    online: {},
    conectado: false,
    rota: { tela: 'home' }
  };

  function ehMestre() { return localStorage.getItem(CH_MESTRE) === '1'; }

  /* Um papel pode ter várias pessoas (ex.: cenário). Nesse caso o link
     leva um número: #/p/cenario-3 → papel 'cenario', vaga 3. */
  function decodePapel(slug) {
    if (!slug) return null;
    if (PAPEIS[slug]) return { papel: slug, slot: 0 };
    var m = /^([a-z0-9]+)-(\d{1,2})$/.exec(String(slug));
    if (m && PAPEIS[m[1]] && PAPEIS[m[1]].varios) return { papel: m[1], slot: Number(m[2]) };
    return null;
  }
  function chaveDe(papel, slot) { return slot ? papel + '-' + slot : papel; }
  function nomeComSlot(papel, slot) {
    var p = PAPEIS[papel];
    return (p ? p.nome : papel) + (slot ? ' ' + slot : '');
  }

  /* ---------------- regras do roteiro ---------------- */
  function ehDe(cue, papel) {
    if (!cue) return false;
    var q = cue.quem || [];
    if (q.indexOf('todos') >= 0) return true;
    if (q.indexOf(papel) >= 0) return true;
    if (papel === 'som') return !!cue.som;
    if (papel === 'cenario') return !!cue.cenario || cue.tipo === 'transicao';
    if (papel === 'cortina') return !!cue.cortina;
    return false;
  }
  function proximoDe(papel, inicio) {
    for (var i = Math.max(0, inicio); i < total(); i++) if (ehDe(CUES[i], papel)) return i;
    return -1;
  }
  function papeisAtivos(cue) {
    return Object.keys(PAPEIS).filter(function (k) { return k !== 'diretor' && ehDe(cue, k); });
  }
  function rotuloTipo(c) {
    var nomes = {
      abertura: 'ABERTURA', entrada: 'ENTRADA EM CENA', fala: 'FALA',
      acao: 'AÇÃO / RUBRICA', transicao: 'TROCA DE CENÁRIO', final: 'FINAL'
    };
    return 'CENA ' + c.cena + ' · ' + (nomes[c.tipo] || 'MARCAÇÃO');
  }
  function textoCortina(v) {
    if (v === 'abrir') return 'ABRIR AS CORTINAS';
    if (v === 'fechar') return 'FECHAR AS CORTINAS';
    return 'TROCA À VISTA — NÃO FECHAR. Fique no seu posto.';
  }

  /* ---------------- rota ---------------- */
  function lerRota() {
    var h = location.hash.replace(/^#\/?/, '');
    var p = h.split('/').filter(Boolean);
    var d = p[0] === 'p' ? decodePapel(p[1]) : null;
    if (d) return { tela: 'papel', papel: d.papel, slot: d.slot };
    if (p[0] === 'controle') return { tela: 'controle', papel: null };
    if (p[0] === 'qr') return { tela: 'qr', papel: null };
    return { tela: 'home', papel: null };
  }

  /* ============================================================
     COMUNICAÇÃO AO VIVO
     ============================================================ */
  var cliente = null, brokerIdx = 0, ligado = false, presTimer = null;

  function novoId() { return 'teatro-' + Math.random().toString(36).slice(2, 10); }

  function conectarBroker() {
    if (ligado || typeof mqtt === 'undefined') return;
    var url = CONFIG.brokers[brokerIdx % CONFIG.brokers.length];
    var c;
    try {
      c = mqtt.connect(url, {
        clientId: novoId(), clean: true, keepalive: 30,
        connectTimeout: 9000, reconnectPeriod: 3000
      });
    } catch (e) { brokerIdx++; return; }
    cliente = c;
    var ok = false;

    var t = setTimeout(function () {
      if (ok) return;
      try { c.end(true); } catch (e) { }
      brokerIdx++;
      setTimeout(conectarBroker, 400);
    }, 11000);

    c.on('connect', function () {
      ok = true; ligado = true; clearTimeout(t);
      estado.conectado = true;
      c.subscribe(topico('cue'), { qos: 0 });
      c.subscribe(topico('pres'), { qos: 0 });
      if (ehMestre() && estado.rota.tela === 'controle') publicarCue();
      entrarNaSala();
      render();
    });
    c.on('message', function (tp, payload) { aoReceber(tp, payload); });
    c.on('close', function () {
      estado.conectado = false;
      if (!ok) brokerIdx++;
      render();
    });
    c.on('error', function () { });
  }

  function entrarNaSala() {
    if (presTimer) { clearInterval(presTimer); presTimer = null; }
    var papel = estado.rota.papel;
    if (!papel) return;
    var chave = chaveDe(papel, estado.rota.slot);
    var publica = function () {
      if (cliente && estado.conectado) {
        try { cliente.publish(topico('pres'), JSON.stringify({ r: chave, t: Date.now() }), { qos: 0 }); } catch (e) { }
      }
    };
    publica();
    presTimer = setInterval(publica, 12000);
  }

  function publicarCue() {
    if (cliente && estado.conectado) {
      try {
        cliente.publish(topico('cue'), JSON.stringify({ n: estado.cue, t: Date.now() }), { qos: 0, retain: true });
      } catch (e) { }
    }
  }

  function aoReceber(tp, payload) {
    var msg;
    try { msg = JSON.parse(payload.toString()); } catch (e) { return; }

    if (tp === topico('cue')) {
      if (ehMestre() && estado.rota.tela === 'controle') return; /* o mestre é a fonte */
      if (typeof msg.n === 'number' && limitar(msg.n) !== estado.cue) {
        estado.cue = limitar(msg.n);
        render();
      }
    } else if (tp === topico('pres')) {
      if (msg.r && decodePapel(msg.r)) { estado.online[msg.r] = Date.now(); atualizarOnline(); }
    }
  }

  function atualizarOnline() {
    var alvo = document.getElementById('online');
    if (alvo) alvo.innerHTML = chipsOnline();
  }
  function chipsOnline() {
    var agora = Date.now(), n = 0, html = '';
    Object.keys(estado.online).forEach(function (k) {
      var d = decodePapel(k);
      if (agora - estado.online[k] < 25000 && d) {
        n++;
        html += '<span class="chip online">' + esc(nomeComSlot(d.papel, d.slot)) + '</span>';
      }
    });
    if (!n) return '<span class="chip">Nenhum aparelho conectado ainda</span>';
    return html;
  }

  /* ---------------- navegação de marcações ---------------- */
  function irPara(i) {
    var n = limitar(i);
    estado.cue = n;
    localStorage.setItem(CH_CUE, String(n));
    publicarCue();
    render();
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { }
  }

  /* ============================================================
     PEDAÇOS DE HTML
     ============================================================ */
  function dotHtml() {
    return '<span class="dot' + (estado.conectado ? ' on' : '') + '"></span>';
  }
  function topoHtml(titulo, sub, extra) {
    return '<div class="topo">' + dotHtml() +
      '<div><div class="id">' + esc(titulo) + '</div>' +
      (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') + '</div>' +
      '<div class="dir">' + (extra || '') + '</div></div>';
  }
  function bloco(classe, rotulo, texto) {
    return '<div class="bloco ' + classe + '"><div class="rotulo">' + rotulo +
      '</div><div class="conteudo">' + esc(texto) + '</div></div>';
  }
  function barraProgresso() {
    var pct = Math.round(((estado.cue + 1) / total()) * 100);
    return '<div class="linha-info"><span>' + esc(CENAS[CUES[estado.cue].cena]) + '</span>' +
      '<span>' + (estado.cue + 1) + ' / ' + total() + '</span></div>' +
      '<div class="progresso"><i style="width:' + pct + '%"></i></div>';
  }

  /* ---------------- tela inicial ---------------- */
  function homeHtml() {
    var atores = [], equipe = [];
    Object.keys(PAPEIS).forEach(function (k) {
      (PAPEIS[k].tipo === 'ator' ? atores : equipe).push(k);
    });

    function cartao(k) {
      var p = PAPEIS[k];
      return '<a href="#/p/' + k + '"><span class="e">' + (p.emoji || '🎭') + '</span>' +
        '<span class="n">' + esc(p.nome) + '</span></a>';
    }

    return '<div class="hero"><div class="marca">🎭</div>' +
      '<h1>João e Maria</h1>' +
      '<p>Painel do teatro · ' + total() + ' marcações</p></div>' +
      '<a class="btn principal bloco100" href="#/controle">🔑 Entrar como controlador</a>' +
      '<div class="secao-titulo">Elenco</div><div class="grade">' + atores.map(cartao).join('') + '</div>' +
      '<div class="secao-titulo">Equipe</div><div class="grade equipe">' + equipe.map(cartao).join('') + '</div>' +
      '<p class="contexto" style="margin-top:18px;text-align:center">' + dotHtml() +
      (estado.conectado ? ' Conectado ao painel' : ' Conectando...') + '</p>';
  }

  /* ---------------- senha do controlador ---------------- */
  function entrarHtml() {
    return '<div class="login" style="padding-top:36px">' +
      '<div class="hero"><div class="marca">🔑</div><h1>Controlador</h1>' +
      '<p>Digite sua senha para tornar este aparelho o controle da peça.</p></div>' +
      '<form id="form-senha">' +
      '<input id="pin" type="password" inputmode="numeric" autocomplete="current-password" placeholder="••••" maxlength="12">' +
      '<div class="erro" id="erro-senha"></div>' +
      '<button class="btn principal bloco100" type="submit">Entrar</button>' +
      '</form>' +
      '<div style="margin-top:16px"><a class="btn fantasma bloco100" href="#/">Voltar</a></div>' +
      '</div>';
  }

  /* ---------------- painel do controlador ---------------- */
  function controleHtml() {
    var c = CUES[estado.cue];
    var chips = papeisAtivos(c).map(function (k) {
      return '<span class="chip ativo">' + esc(PAPEIS[k].nome) + '</span>';
    }).join('') || '<span class="chip">Ninguém (marcação técnica)</span>';
    if ((c.quem || []).indexOf('todos') >= 0) chips = '<span class="chip ativo">TODOS</span>';

    var prox = CUES[estado.cue + 1];

    return topoHtml('CONTROLE · AO VIVO', 'João e Maria', 
      '<a class="btn pequeno fantasma" href="#/qr">QR codes</a>' +
      '<button class="btn pequeno perigo" id="b-sair">Sair</button>') +
      barraProgresso() +
      '<div class="card destaque">' +
      '<div class="etiqueta amarela">' + esc(rotuloTipo(c)) + '</div>' +
      '<h1 class="titulo">' + esc(c.titulo) + '</h1>' +
      '<p class="fala grande">' + esc(c.texto) + '</p>' +
      (c.cenario ? bloco('cena', '📦 CENÁRIO', c.cenario) : '') +
      (c.cortina ? bloco('cortina', '🎭 CORTINA', textoCortina(c.cortina)) : '') +
      (c.som ? bloco('som', '🔊 SOM', c.som) : '') +
      '</div>' +

      '<div class="card"><div class="etiqueta verde">Recebem agora</div><div class="chips">' + chips + '</div>' +
      '<div class="etiqueta" style="margin-top:16px">Aparelhos conectados</div>' +
      '<div class="chips" id="online">' + chipsOnline() + '</div></div>' +

      (prox ? '<div class="card"><div class="etiqueta">A seguir</div>' +
        '<div class="item"><span class="n">' + (estado.cue + 2) + '</span>' +
        '<span><span class="c">' + esc(prox.titulo) + '</span>' +
        '<span class="t">' + esc(prox.texto.slice(0, 110)) + (prox.texto.length > 110 ? '…' : '') + '</span></span></div></div>' : '') +

      '<details class="card"><summary class="etiqueta" style="cursor:pointer;margin:0">📜 Roteiro completo — toque para pular para qualquer ponto</summary>' +
      '<div class="lista">' + listaCompleta() + '</div></details>' +

      '<div class="barra-acoes">' +
      '<button class="btn" id="b-volt"' + (estado.cue === 0 ? ' disabled' : '') + '>◀ Voltar</button>' +
      '<button class="btn principal" id="b-prox"' + (estado.cue >= total() - 1 ? ' disabled' : '') + '>' +
      (estado.cue >= total() - 1 ? 'Fim da peça' : 'Próxima ▶') + '</button>' +
      '</div>';
  }

  function listaCompleta() {
    var html = '', cenaAtual = 0;
    CUES.forEach(function (c, i) {
      if (c.cena !== cenaAtual) {
        cenaAtual = c.cena;
        html += '<div class="separador-cena">' + esc(CENAS[c.cena]) + '</div>';
      }
      html += '<button class="item' + (i === estado.cue ? ' atual' : '') + '" data-ir="' + i + '">' +
        '<span class="n">' + (i + 1) + '</span>' +
        '<span><span class="c">' + esc(c.titulo) + '</span>' +
        '<span class="t">' + esc(c.texto.slice(0, 90)) + (c.texto.length > 90 ? '…' : '') + '</span></span></button>';
    });
    return html;
  }

  /* ---------------- painel de um papel ---------------- */
  function painelHtml(papel) {
    if (papel === 'diretor') return diretorHtml();

    var p = PAPEIS[papel];
    var c = CUES[estado.cue];
    var ativo = ehDe(c, papel);

    var abas = '<div class="abas">' +
      '<button data-aba="agora" class="' + (estado.aba === 'agora' ? 'on' : '') + '">AGORA</button>' +
      '<button data-aba="roteiro" class="' + (estado.aba === 'roteiro' ? 'on' : '') + '">MEU ROTEIRO</button>' +
      '</div>';

    var corpo;
    if (estado.aba === 'roteiro') {
      corpo = '<div class="card"><div class="etiqueta">Suas marcações (' +
        CUES.filter(function (x) { return ehDe(x, papel); }).length + ')</div>' +
        '<div class="lista">' + listaDoPapel(papel) + '</div></div>';
    } else {
      corpo = (ativo ? cartaoAtivo(papel, c) : cartaoEspera(papel, c))
        + '<div class="card"><div class="etiqueta">No palco agora</div>' +
        '<div class="item"><span class="n">' + (estado.cue + 1) + '</span>' +
        '<span><span class="c">' + esc(c.titulo) + '</span>' +
        '<span class="t">' + esc(rotuloTipo(c)) + '</span></span></div></div>';
    }

    var titulo = nomeComSlot(papel, estado.rota.slot);
    return topoHtml(titulo, p.tipo === 'ator' ? 'Ator' : 'Equipe',
      '<a class="btn pequeno fantasma" href="#/">Trocar</a>') +
      barraProgresso() + abas + corpo;
  }

  function cartaoAtivo(papel, c) {
    var cls = 'card destaque';
    var cabec = '<div class="etiqueta amarela">' + esc(rotuloTipo(c)) + '</div>';
    var html = '';

    if (papel === 'som') {
      html = '<div class="etiqueta vermelha">🔊 TOCAR AGORA</div>' +
        '<p class="fala grande">' + esc(c.som) + '</p>' +
        '<p class="contexto">' + esc(c.titulo) + ' — ' + esc(c.texto) + '</p>';
      return '<div class="' + cls + '">' + cabec + html + '</div>';
    }
    if (papel === 'cenario') {
      html = '<div class="etiqueta vermelha">📦 SUA HORA — CENÁRIO</div>' +
        '<p class="fala grande">' + esc(c.cenario || c.texto) + '</p>' +
        (c.cenario ? '<p class="contexto"><b>No palco:</b> ' + esc(c.texto) + '</p>' : '') +
        (c.cortina ? bloco('cortina', '🎭 CORTINA', textoCortina(c.cortina)) : '');
      return '<div class="' + cls + '">' + cabec + html + '</div>';
    }
    if (papel === 'cortina') {
      var acaoC = textoCortina(c.cortina);
      html = '<div class="etiqueta vermelha">🎭 SUA HORA — CORTINA</div>' +
        '<p class="fala grande">' + esc(acaoC) + '</p>' +
        '<p class="contexto">' + esc(c.texto) + '</p>' +
        (c.cenario ? bloco('cena', '📦 Enquanto isso, o cenário', c.cenario) : '');
      return '<div class="' + cls + '">' + cabec + html + '</div>';
    }

    /* ator */
    var ehAcao = (c.tipo === 'acao' || c.tipo === 'entrada' || c.tipo === 'transicao');
    html = '<div class="etiqueta vermelha">' + (ehAcao ? '⏱ É A SUA HORA — AÇÃO' : '🗣 SUA DEIXA') + '</div>' +
      '<p class="fala grande">' + esc(c.texto) + '</p>' +
      (c.som ? bloco('som', '🔊 Som', c.som) : '') +
      (c.cortina && c.tipo !== 'fala' ? bloco('cortina', '🎭 Cortina', textoCortina(c.cortina)) : '');
    return '<div class="' + cls + '">' + cabec + html + '</div>';
  }

  function cartaoEspera(papel, c) {
    var prox = proximoDe(papel, estado.cue + 1);
    var depois = '';
    if (prox >= 0) {
      var pc = CUES[prox];
      depois = '<div class="card"><div class="etiqueta">Sua próxima marcação · nº ' + (prox + 1) + '</div>' +
        '<div class="item"><span class="n">' + (prox + 1) + '</span>' +
        '<span><span class="c">' + esc(pc.titulo) + '</span>' +
        '<span class="t">' + esc((pc.som && papel === 'som') ? pc.som : (pc.cenario && papel === 'cenario') ? pc.cenario : pc.texto.slice(0, 120)) + '</span></span></div></div>';
    } else {
      depois = '<div class="card"><div class="etiqueta">Tudo certo</div>' +
        '<p class="fala">Suas marcações terminaram. 🎉</p></div>';
    }
    return '<div class="card"><div class="espera">' +
      '<div class="icone">🎧</div>' +
      '<div class="etiqueta">Aguarde</div>' +
      '<div class="txt">Não é sua vez ainda. Fique de olho — quando chegar a sua hora, a tela muda sozinha.</div>' +
      '</div></div>' + depois;
  }

  function listaDoPapel(papel) {
    var html = '', cenaAtual = 0, nada = true;
    CUES.forEach(function (c, i) {
      if (!ehDe(c, papel)) return;
      nada = false;
      if (c.cena !== cenaAtual) {
        cenaAtual = c.cena;
        html += '<div class="separador-cena">' + esc(CENAS[c.cena]) + '</div>';
      }
      var texto = (papel === 'som' && c.som) ? c.som : (papel === 'cenario' && c.cenario) ? c.cenario : c.texto;
      html += '<div class="item' + (i === estado.cue ? ' atual' : '') + '">' +
        '<span class="n">' + (i + 1) + '</span>' +
        '<span><span class="c">' + esc(c.titulo) + '</span>' +
        '<span class="t">' + esc(texto) + '</span></span></div>';
    });
    return nada ? '<p class="contexto">Nenhuma marcação para este papel.</p>' : html;
  }

  /* ---------------- diretor ---------------- */
  function diretorHtml() {
    var c = CUES[estado.cue];
    return topoHtml('DIRETOR', 'João e Maria · roteiro ao vivo',
      '<a class="btn pequeno fantasma" href="#/">Trocar</a>') +
      '<div class="card destaque" style="padding:14px 16px">' +
      '<div class="etiqueta amarela">AO VIVO · marcação ' + (estado.cue + 1) + ' de ' + total() + '</div>' +
      '<p class="fala">' + esc(c.titulo) + ' — ' + esc(CENAS[c.cena]) + '</p>' +
      '</div>' +
      '<div class="card"><div class="etiqueta">Roteiro completo</div>' +
      '<div class="lista">' + listaCompleta() + '</div></div>';
  }

  /* ---------------- QR codes ---------------- */
  function urlDoPapel(k, slot) {
    return location.origin + location.pathname + '#/p/' + chaveDe(k, slot);
  }

  function qtdDe(k) {
    var p = PAPEIS[k];
    if (!p || !p.varios) return 0;
    var n = parseInt(localStorage.getItem(CH_QTD + '_' + k), 10);
    if (isNaN(n)) n = p.varios;
    return Math.max(1, Math.min(30, n));
  }

  function itemQr(k, slot) {
    var url = urlDoPapel(k, slot);
    var svg = '';
    try {
      var q = qrcode(0, 'M');
      q.addData(url);
      q.make();
      svg = q.createSvgTag({ cellSize: 4, margin: 1 });
    } catch (e) {
      svg = '<div style="font-size:.7rem">' + esc(url) + '</div>';
    }
    return '<div class="qr-item">' + svg +
      '<div class="nome">' + esc(nomeComSlot(k, slot)) + '</div>' +
      '<div class="link">' + esc(url.replace(/^https?:\/\//, '')) + '</div></div>';
  }

  function qtdHtml() {
    return Object.keys(PAPEIS).filter(function (k) { return PAPEIS[k].varios; }).map(function (k) {
      return '<div class="qtd-linha"><span>' + esc(PAPEIS[k].nome) + ' — quantos códigos:</span>' +
        '<b>' + qtdDe(k) + '</b>' +
        '<button class="btn pequeno" data-qtd="' + k + '" data-dir="-1">−</button>' +
        '<button class="btn pequeno" data-qtd="' + k + '" data-dir="1">+</button></div>';
    }).join('');
  }

  function qrHtml() {
    var itens = '';
    Object.keys(PAPEIS).forEach(function (k) {
      var n = qtdDe(k);
      if (n) {
        for (var i = 1; i <= n; i++) itens += itemQr(k, i);
      } else {
        itens += itemQr(k, 0);
      }
    });

    return topoHtml('QR CODES', 'Um código por pessoa',
      '<button class="btn pequeno principal" id="b-imprimir">Imprimir</button>' +
      '<a class="btn pequeno fantasma" href="#/controle">Voltar</a>') +
      '<div class="card"><p class="contexto" style="margin:0 0 12px">Cada pessoa aponta a câmera do celular para o seu código e já entra na tela dela. ' +
      'Basta ter o site aberto uma vez: o código aponta para o endereço abaixo.</p>' +
      qtdHtml() +
      '<p class="contexto" style="margin:12px 0 0">As equipes de <b>cenário</b>, <b>cortina</b> e <b>som</b> têm vários códigos numerados: ' +
      'a tela é a mesma para todos, mas cada pessoa fica com o seu e você vê separado quem está online.</p></div>' +
      '<div class="card"><div class="qr-grade">' + itens + '</div></div>';
  }

  /* ============================================================
     RENDER
     ============================================================ */
  function render() {
    estado.rota = lerRota();
    var app = document.getElementById('app');
    if (!app) return;
    var r = estado.rota, html;

    if (r.tela === 'papel') html = painelHtml(r.papel);
    else if (r.tela === 'controle') html = ehMestre() ? controleHtml() : entrarHtml();
    else if (r.tela === 'qr') html = ehMestre() ? qrHtml() : entrarHtml();
    else html = homeHtml();

    app.innerHTML = html;
    depoisDeRender();
  }

  function depoisDeRender() {
    var r = estado.rota;

    var form = document.getElementById('form-senha');
    if (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var v = (document.getElementById('pin') || {}).value || '';
        if (v === CONFIG.senhaMestre) {
          localStorage.setItem(CH_MESTRE, '1');
          if (location.hash !== '#/controle') location.hash = '#/controle';
          else render();
        } else {
          var e = document.getElementById('erro-senha');
          if (e) e.textContent = 'Senha incorreta. Tente de novo.';
          var pin = document.getElementById('pin');
          if (pin) { pin.value = ''; pin.focus(); }
        }
      });
      var pin = document.getElementById('pin');
      if (pin) pin.focus();
    }

    var bSair = document.getElementById('b-sair');
    if (bSair) bSair.onclick = function () {
      localStorage.removeItem(CH_MESTRE);
      location.hash = '#/';
    };

    var bProx = document.getElementById('b-prox');
    if (bProx) bProx.onclick = function () { irPara(estado.cue + 1); };
    var bVolt = document.getElementById('b-volt');
    if (bVolt) bVolt.onclick = function () { irPara(estado.cue - 1); };

    var bImp = document.getElementById('b-imprimir');
    if (bImp) bImp.onclick = function () { window.print(); };

    Array.prototype.forEach.call(document.querySelectorAll('[data-ir]'), function (b) {
      b.onclick = function () { irPara(Number(b.getAttribute('data-ir'))); };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-aba]'), function (b) {
      b.onclick = function () {
        estado.aba = b.getAttribute('data-aba');
        render();
      };
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-qtd]'), function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-qtd');
        var n = qtdDe(k) + Number(b.getAttribute('data-dir'));
        n = Math.max(1, Math.min(30, n));
        localStorage.setItem(CH_QTD + '_' + k, String(n));
        render();
      };
    });

    if (r.tela === 'papel') {
      entrarNaSala();
      var atual = document.querySelector('.item.atual');
      if (r.papel === 'diretor' && atual && atual.scrollIntoView) {
        try { atual.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) { }
      }
    }
  }

  /* ---------------- atalhos de teclado (no controle) ---------------- */
  document.addEventListener('keydown', function (ev) {
    if (estado.rota.tela !== 'controle' || !ehMestre()) return;
    var alvo = ev.target || {};
    if (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA') return;
    if (ev.key === 'ArrowRight' || ev.key === ' ' || ev.key === 'PageDown') {
      ev.preventDefault(); irPara(estado.cue + 1);
    } else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') {
      ev.preventDefault(); irPara(estado.cue - 1);
    }
  });

  /* ---------------- início ---------------- */
  window.addEventListener('hashchange', render);
  render();
  conectarBroker();

  /* limpa a lista de aparelhos online de vez em quando */
  setInterval(function () {
    if (estado.rota.tela === 'controle') atualizarOnline();
  }, 6000);
})();
