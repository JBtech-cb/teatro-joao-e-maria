/* ============================================================
   CONFIGURAÇÕES — é aqui que você troca sua senha e o "canal".
   ============================================================ */

const CONFIG = {
  /* Senha do CONTROLADOR (você). Troque por uma sua. */
  senhaMestre: '1234',

  /* Nome do "canal" da peça. Todos os aparelhos que abrirem o site
     entram nesse mesmo canal automaticamente. Se algum dia a peça
     parar de sincronizar por causa de outra pessoa usando o mesmo
     nome em outro lugar, troque aqui por outro nome. */
  sala: 'joao-e-maria-2f9c',

  /* Servidores públicos de mensagens (não precisa criar conta).
     O site tenta o primeiro; se não conseguir, tenta o segundo. */
  brokers: [
    'wss://broker.emqx.io:8084/mqtt',
    'wss://broker.hivemq.com:8884/mqtt',
  ],
};
