// repositories/PedidoRepository.js — Repository Pattern
const db = require('../db');

class PedidoRepository {
  save(pedido) {
    db.pedidos.push(pedido);
    return pedido;
  }
  findAll() {
    return db.pedidos;
  }
}

module.exports = new PedidoRepository();
