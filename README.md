# 🎭 Painel do Teatro — João e Maria

Sistema para dirigir a peça pelo celular: você entra com a senha, avança o roteiro e cada pessoa
recebe na tela só o que precisa fazer naquele momento.

---

## 1. Como funciona

- **Você (controlador):** entra com a senha, vê a marcação atual e aperta **Próxima**.
- **Cada amigo:** escaneia o QR code da função dele (ator, som, cenário, cortina ou diretor) e cai
  na tela dele. Não precisa senha nem instalar nada. Nenhum nome de pessoa aparece no sistema:
  só a função (Narrador, João, Maria, Bruxa, Cenário 3, Som 1, Diretor...).
- **Equipes com muita gente:** cenário, cortina e som têm vários QR codes numerados (Cenário 1,
  Cenário 2, ...). A tela é a mesma para todos da equipe, mas cada pessoa escaneia o seu código —
  e no controle você vê, separado, quem já está online.
- **Ao vivo:** quando você avança, a tela de quem precisa muda sozinha, em cerca de 1 segundo.

O roteiro já está todo dentro do sistema: **75 marcações**, das 6 cenas, tiradas do PDF original.

---

## 2. Trocar a senha (importante)

Abra `js/config.js` e mude a linha:

```js
senhaMestre: '1234',
```

Depois de entrar uma vez, aquele aparelho fica logado (não precisa digitar de novo). O botão
**Sair** desloga.

> Como o site é público, essa senha fica visível no código para quem for "fuçando".
> Use uma senha só da peça, não uma senha importante sua.

No mesmo arquivo existe `sala: 'joao-e-maria-2f9c'`. É o "canal" da peça — todo mundo que abre o
site entra nele automaticamente.

---

## 3. Publicar no Vercel (grátis)

1. Entre em **vercel.com** com a mesma conta do GitHub.
2. **Add New… → Project**.
3. Escolha o repositório **teatro-joao-e-maria** e clique em **Import** (se ele não aparecer, clique
   em *Adjust GitHub App Permissions* e libere o acesso a esse repositório).
4. Não mexa em nenhuma configuração: clique em **Deploy**.
5. Em ~1 minuto sai o endereço, tipo `teatro-joao-e-maria.vercel.app`. Esse é o link que todos vão usar.

Sempre que você editar um arquivo aqui no GitHub, o Vercel publica a versão nova sozinho.

---

## 4. Antes da peça (checklist)

1. Abra o link no seu celular → **Entrar como controlador** (senha `1234`) → **QR codes**.
   Na tela dos códigos, use **−** e **+** ao lado de Cenário, Cortina e Som para escolher quantas
   pessoas tem em cada equipe — os códigos numerados aparecem na hora. Depois **Imprimir** (ou
   mande o print no grupo). Cada pessoa escaneia o dela.
2. Peça para todos deixarem o celular com a tela acesa. Se a tela apagar, é só tocar de novo — a
   marcação atual volta na hora.
3. Faça um ensaio: avance até o fim e volte, para ver se todo mundo recebe.
4. Na tela do controle aparece **"Aparelhos conectados"**: ali você vê quem já está online.
5. Precisa de internet estável (Wi-Fi ou 4G). Não precisa instalar nenhum aplicativo.

### Se algo der errado na hora

- **Sua tela funciona, mas os outros não recebem:** a internet do local caiu ou o servidor público
  de mensagens está instável. O controle continua funcionando no seu aparelho — continue dirigindo
  e avisando de viva voz. Recarregue a página quando a rede voltar.
- **A tela de alguém travou numa marcação antiga:** peça para recarregar a página; ele volta
  automaticamente para a marcação certa.
- **Trocou de celular no meio da peça:** abra o link, entre com a senha; o controle continua de onde
  você parou.

---

## 5. Atalhos no computador (opcional)

Na tela de controle, com o teclado: **→** ou **espaço** avança, **←** volta. Útil se você usar um
notebook como controle.

---

## 6. Detalhes técnicos

- Site estático puro: `index.html`, `css/estilo.css`, `js/app.js`, `js/roteiro.js`, `js/config.js`.
- Sem build, sem dependências instaladas, sem banco de dados, sem chaves de API.
- As bibliotecas (`mqtt` e gerador de QR code) vêm de um CDN público, carregadas direto pelo
  `index.html`.
- Sincronização via MQTT sobre WebSocket em servidores públicos gratuitos (`broker.emqx.io` e
  `broker.hivemq.com`, com troca automática se um falhar). A mensagem fica retida no servidor, então
  quem entrar atrasado já vê a marcação atual.
- O roteiro fica em `js/roteiro.js`. Cada item da lista `CUES` é uma marcação, com os campos:
  `cena`, `tipo`, `quem` (papéis), `titulo`, `texto`, `cenario`, `cortina`
  (`abrir`/`fechar`/`vista`) e `som`. Cada papel em `PAPEIS` pode ter `varios: N` para gerar N
  QR codes numerados.
