/* ============================================================
   JOÃO E MARIA — Roteiro teatral escolar, convertido em marcações.
   Cada item da lista CUES é um "ponto" que o controlador avança.
   ============================================================ */

const PAPEIS = {
  narrador: { nome: 'Narrador',  tipo: 'ator',   emoji: '🎙️' },
  joao:     { nome: 'João',      tipo: 'ator',   emoji: '👦' },
  maria:    { nome: 'Maria',     tipo: 'ator',   emoji: '👧' },
  bruxa:    { nome: 'Bruxa',     tipo: 'ator',   emoji: '🧙‍♀️' },
  madrasta: { nome: 'Madrasta',  tipo: 'ator',   emoji: '👩' },
  pai:      { nome: 'Pai',       tipo: 'ator',   emoji: '👨' },
  arvore1:  { nome: 'Árvore 1',  tipo: 'ator',   emoji: '🌳' },
  arvore2:  { nome: 'Árvore 2',  tipo: 'ator',   emoji: '🌳' },
  som:      { nome: 'Som',       tipo: 'equipe', emoji: '🔊', varios: 2 },
  cenario:  { nome: 'Cenário',   tipo: 'equipe', emoji: '📦', varios: 8 },
  cortina:  { nome: 'Cortina',   tipo: 'equipe', emoji: '🎭', varios: 3 },
  diretor:  { nome: 'Diretor',   tipo: 'equipe', emoji: '🎬' },
};

const CENAS = {
  1: 'Cena 1 — Em casa',
  2: 'Cena 2 — Na floresta',
  3: 'Cena 3 — Perdidos',
  4: 'Cena 4 — A casa de doces',
  5: 'Cena 5 — A armadilha',
  6: 'Cena 6 — O caminho de volta',
};

/* tipo: abertura | entrada | fala | acao | transicao | final
   cortina: 'abrir' | 'fechar' | 'vista' (troca à vista, não fechar) */
const CUES = [
  /* ---------------- CENA 1 ---------------- */
  { cena: 1, tipo: 'abertura', quem: ['cortina', 'cenario'], titulo: 'ABERTURA',
    texto: 'Abrir as cortinas com a casa simples já montada.',
    cenario: 'Conferir antes de abrir: lareira de papelão, janela ao fundo e mesinha com as tigelas vazias no centro.',
    cortina: 'abrir', som: 'Música tema de abertura (enquanto o público entra)' },

  { cena: 1, tipo: 'entrada', quem: ['pai', 'madrasta', 'joao', 'maria'], titulo: 'ENTRADA DA FAMÍLIA',
    texto: 'Pai, Madrasta, João e Maria entram e se reúnem ao redor da mesa.' },

  { cena: 1, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Era uma vez dois irmãos, João e Maria, que viviam com o pai e a madrasta. A família passava por um período difícil, e havia pouca comida em casa.' },

  { cena: 1, tipo: 'fala', quem: ['madrasta'], titulo: 'MADRASTA',
    texto: 'A comida está acabando. Não temos o suficiente para todos.' },

  { cena: 1, tipo: 'fala', quem: ['pai'], titulo: 'PAI',
    texto: 'Vamos encontrar uma solução. Não quero que meus filhos passem fome.' },

  { cena: 1, tipo: 'fala', quem: ['madrasta'], titulo: 'MADRASTA',
    texto: 'Amanhã, leve as crianças para buscar lenha na floresta. Talvez encontremos ajuda por lá.' },

  { cena: 1, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Pai, precisamos mesmo ir?' },

  { cena: 1, tipo: 'fala', quem: ['pai'], titulo: 'PAI',
    texto: 'É só para ajudar. Fiquem perto de mim e não se afastem.' },

  { cena: 1, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Não se preocupe, Maria. Eu vou cuidar de você.' },

  { cena: 1, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'João ouviu a conversa e, preocupado, decidiu guardar algumas pedrinhas no bolso para marcar o caminho de volta.' },

  { cena: 1, tipo: 'transicao', quem: ['cenario', 'arvore1', 'arvore2', 'cortina'], titulo: 'TROCA → FLORESTA',
    texto: 'Todos saem, exceto o Narrador. A equipe de cenário retira a lareira, a janela e a mesa e posiciona os arbustos de papelão da floresta.',
    cenario: 'RETIRAR: lareira, janela, mesa e tigelas.\nCOLOCAR: 4 arbustos de papelão e pedrinhas de papel no chão.\nAs árvores já entram e se posicionam nos lados.',
    cortina: 'vista' },

  /* ---------------- CENA 2 ---------------- */
  { cena: 2, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Na manhã seguinte, o pai levou as crianças para a floresta. Enquanto ele se afastava, João e Maria ficaram esperando.' },

  { cena: 2, tipo: 'fala', quem: ['pai'], titulo: 'PAI',
    texto: 'Esperem aqui um pouquinho. Vou procurar lenha. Já volto.' },

  { cena: 2, tipo: 'acao', quem: ['pai', 'arvore1', 'arvore2'], titulo: 'PAI SAI / ÁRVORES ENTRAM',
    texto: 'Pai sai. As duas árvores entram e ficam paradas entre os arbustos, uma de cada lado. João olha para o chão com as pedrinhas de papel.' },

  { cena: 2, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'João, faz tempo que o pai saiu. Estou com medo.' },

  { cena: 2, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Calma. Eu deixei pedrinhas pelo caminho. Vamos seguir as marcas.' },

  { cena: 2, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Quando a noite chegou, os irmãos conseguiram encontrar o caminho de casa. Mas a madrasta não ficou contente.' },

  { cena: 2, tipo: 'transicao', quem: ['cenario', 'cortina'], titulo: 'TROCA RÁPIDA → CASA',
    texto: 'Transição rápida: a equipe afasta os arbustos e recoloca a lareira e a mesinha com as tigelas vazias no centro do palco.',
    cenario: 'Troca rápida! RETIRAR: arbustos.\nCOLOCAR: mesinha com tigelas vazias + lareira no centro.',
    cortina: 'vista' },

  { cena: 2, tipo: 'fala', quem: ['madrasta'], titulo: 'MADRASTA',
    texto: 'Vocês voltaram? Amanhã terão que ir ainda mais longe!' },

  { cena: 2, tipo: 'fala', quem: ['pai'], titulo: 'PAI',
    texto: 'Não gosto disso. São apenas crianças.' },

  { cena: 2, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Na segunda vez, João tentou pegar pedrinhas, mas não conseguiu. Então deixou cair pequenos pedaços de pão pelo caminho.' },

  { cena: 2, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Pronto. Assim vamos conseguir voltar.' },

  { cena: 2, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Espero que sim.' },

  { cena: 2, tipo: 'transicao', quem: ['cenario', 'arvore1', 'arvore2', 'joao', 'maria', 'cortina'], titulo: 'TROCA → FLORESTA (2ª vez)',
    texto: 'A equipe retira os itens da casa e volta com os arbustos da floresta. As duas árvores se posicionam. João e Maria caminham olhando para o chão, procurando as migalhas.',
    cenario: 'RETIRAR: lareira, mesa e tigelas.\nCOLOCAR: arbustos da floresta.\nAs árvores já se posicionam nos lados.',
    cortina: 'vista' },

  /* ---------------- CENA 3 ---------------- */
  { cena: 3, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Quando tentaram voltar, perceberam que os pedaços de pão tinham desaparecido. Um pássaro da floresta havia descido e roubado todas as migalhas do caminho, deixando os dois irmãos completamente perdidos.' },

  { cena: 3, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'João, cadê o pão que você jogou? Não tem mais nada no chão!' },

  { cena: 3, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Olha lá nos galhos... os pássaros roubaram todas as migalhas! E agora? Não sabemos voltar!' },

  { cena: 3, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Estou com muito medo, João!' },

  { cena: 3, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Vamos continuar juntos. Não vou deixar você sozinha.' },

  { cena: 3, tipo: 'fala', quem: ['arvore1'], titulo: 'ÁRVORE 1',
    texto: '(Com voz misteriosa.) A floresta é grande... vocês sabem para onde estão indo?' },

  { cena: 3, tipo: 'fala', quem: ['arvore2'], titulo: 'ÁRVORE 2',
    texto: '(Com voz misteriosa.) Talvez exista um caminho... ou talvez não.' },

  { cena: 3, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Quem está falando? João, você ouviu?' },

  { cena: 3, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Ouvi. Mas não vamos nos separar. Vamos procurar um lugar seguro.' },

  { cena: 3, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Depois de caminhar mais um pouco, os irmãos viram algo inesperado entre as árvores.' },

  { cena: 3, tipo: 'transicao', quem: ['cenario', 'arvore1', 'arvore2', 'cortina'], titulo: 'TROCA → CASA DE DOCES',
    texto: 'As árvores abrem espaço enquanto a equipe entra e monta a Casa de Doces: o painel colorido de cartolina, a gaiola no canto e o caldeirão gigante no centro.',
    cenario: 'MONTAR: painel da Casa de Doces (verso da janela), gaiola no canto e caldeirão gigante no centro — com a almofada no fundo.',
    cortina: 'vista', som: 'Música de encantamento / descoberta' },

  /* ---------------- CENA 4 ---------------- */
  { cena: 4, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'João! Olha aquela casa! Parece feita de doces!' },

  { cena: 4, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Será que podemos pegar um pedacinho? Estamos com muita fome.' },

  { cena: 4, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Com cuidado, os dois se aproximaram e começaram a provar um pedacinho da casa.' },

  { cena: 4, tipo: 'acao', quem: ['bruxa'], titulo: 'ENTRADA DA BRUXA',
    texto: 'A bruxa aparece diante da casa.',
    som: 'Efeito de susto / risada de bruxa' },

  { cena: 4, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA',
    texto: '(De dentro ou entrando devagar.) Quem está comendo a minha casa?' },

  { cena: 4, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Desculpe! Estávamos com fome e perdidos.' },

  { cena: 4, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA',
    texto: 'Pobres crianças! Entrem, entrem. Aqui terão comida e descanso.' },

  { cena: 4, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Não sei se devemos confiar...' },

  { cena: 4, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA',
    texto: 'Não precisam ter medo. Sou muito bondosa!' },

  { cena: 4, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Mas a gentileza da bruxa escondia uma armadilha. Ela queria prender João e engordá-lo, enquanto Maria teria que trabalhar para ela.' },

  /* ---------------- CENA 5 ---------------- */
  { cena: 5, tipo: 'acao', quem: ['bruxa', 'joao'], titulo: 'JOÃO NA GAIOLA',
    texto: 'A bruxa leva João até o canto e o tranca dentro da gaiola. João segura nas grades enquanto Maria observa assustada.' },

  { cena: 5, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA',
    texto: 'João, fique trancado aí dentro! E você, Maria, venha me ajudar a preparar o caldeirão!' },

  { cena: 5, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Solte o meu irmão! Por que ele precisa ficar preso nessa gaiola?' },

  { cena: 5, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA',
    texto: 'Porque ele está muito magrinho. Vou engordá-lo para fazer uma sopa especial no meu caldeirão!' },

  { cena: 5, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: '(Segurando nas grades.) Maria, ela quer me cozinhar! Você precisa dar um jeito de me tirar daqui!' },

  { cena: 5, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Calma, João, eu vou salvar você! Preciso pensar rápido.' },

  { cena: 5, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Vendo o irmão preso na gaiola, Maria percebeu que precisava agir com muita coragem e inteligência.' },

  { cena: 5, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA',
    texto: 'Maria, venha ver se o caldeirão já está fervendo!' },

  { cena: 5, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Eu não alcanço direito. Pode me mostrar se já está bem quente?' },

  { cena: 5, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA',
    texto: 'Menina boba! É assim que se olha...' },

  { cena: 5, tipo: 'acao', quem: ['bruxa'], titulo: 'BRUXA SE DEBRUÇA',
    texto: 'A bruxa se debruça bem na beirada do caldeirão gigante para olhar dentro.',
    som: 'Música de tensão — subir o volume' },

  { cena: 5, tipo: 'acao', quem: ['maria', 'bruxa'], titulo: '⭐ O EMPURRÃO (marcação principal)',
    texto: 'Maria aproveita o descuido, empurra a bruxa para dentro do caldeirão e corre imediatamente até a gaiola para abrir a porta e soltar João.',
    som: 'EFEITO: queda no caldeirão / respingo d\u2019água' },

  { cena: 5, tipo: 'fala', quem: ['bruxa'], titulo: 'BRUXA (de dentro do caldeirão)',
    texto: '(De dentro do caldeirão, gritando e enfraquecendo aos poucos.) Aaaah! Me tirem daqui! Não corram... voltem aqui... não fujam...' },

  { cena: 5, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: '(Abrindo rápido a gaiola.) Rápido, João! Vamos sair daqui agora!' },

  { cena: 5, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: '(Saindo da gaiola e abraçando a irmã.) Você conseguiu, Maria! Vamos fugir!' },

  { cena: 5, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Com a bruxa derrotada no caldeirão, os irmãos correram para longe da casa e finalmente conseguiram escapar.' },

  { cena: 5, tipo: 'transicao', quem: ['cenario', 'bruxa', 'cortina'], titulo: 'TROCA → FLORESTA (final)',
    texto: 'A equipe entra e retira o painel da Casa de Doces, a gaiola e o caldeirão — levando a bruxa escondida atrás do painel — e recoloca os arbustos da floresta no palco.',
    cenario: 'RETIRAR: painel da Casa de Doces, gaiola e caldeirão.\nATENÇÃO: a Bruxa sai escondida atrás do painel.\nCOLOCAR: arbustos da floresta.',
    cortina: 'vista' },

  /* ---------------- CENA 6 ---------------- */
  { cena: 6, tipo: 'acao', quem: ['arvore1', 'arvore2', 'joao', 'maria'], titulo: 'ÁRVORES ABREM CAMINHO',
    texto: 'As árvores abrem caminho entre os arbustos. João e Maria caminham juntos.' },

  { cena: 6, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Estou feliz que estamos juntos. Achei que nunca sairíamos daquela floresta.' },

  { cena: 6, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Nós conseguimos porque não desistimos e ajudamos um ao outro.' },

  { cena: 6, tipo: 'fala', quem: ['arvore1'], titulo: 'ÁRVORE 1',
    texto: 'O caminho de volta está logo ali!' },

  { cena: 6, tipo: 'fala', quem: ['arvore2'], titulo: 'ÁRVORE 2',
    texto: 'Sigam em frente. Vocês estão quase em casa!' },

  { cena: 6, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'Depois de muito caminhar, os irmãos finalmente encontraram o pai.' },

  { cena: 6, tipo: 'acao', quem: ['pai'], titulo: 'PAI ENTRA',
    texto: 'Pai entra e corre até os filhos.' },

  { cena: 6, tipo: 'fala', quem: ['pai'], titulo: 'PAI',
    texto: 'João! Maria! Vocês estão bem! Eu procurei por vocês e nunca perdi a esperança de encontrá-los.' },

  { cena: 6, tipo: 'fala', quem: ['maria'], titulo: 'MARIA',
    texto: 'Sentimos sua falta, pai.' },

  { cena: 6, tipo: 'fala', quem: ['joao'], titulo: 'JOÃO',
    texto: 'Passamos por muitos perigos, mas conseguimos voltar.' },

  { cena: 6, tipo: 'fala', quem: ['pai'], titulo: 'PAI',
    texto: 'Me perdoem por não ter protegido vocês. Nunca mais vou deixá-los sozinhos.' },

  { cena: 6, tipo: 'fala', quem: ['narrador'], titulo: 'NARRADOR',
    texto: 'E assim, João e Maria voltaram para casa. Aprenderam que, mesmo nos momentos mais difíceis, coragem, união e inteligência podem ajudar a superar os perigos.' },

  { cena: 6, tipo: 'final', quem: ['todos'], titulo: 'REVERÊNCIA / FIM',
    texto: 'Todos os personagens e a equipe de cenografia entram no palco para a reverência final.',
    cenario: 'Todos entram para a reverência. Depois, recolher tudo do palco.',
    cortina: 'fechar', som: 'Música final + aplausos' },
];
