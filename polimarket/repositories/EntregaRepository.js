// repositories/EntregaRepository.js — Repository Pattern
const db = require('../db');

class EntregaRepository {
  save(entrega) {
    db.entregas.push(entrega);
    return entrega;
  }
  findById(id) {
    return db.entregas.find(e => e.id === id) || null;
  }
  findAll() {
    return db.entregas;
  }
}

module.exports = new EntregaRepository();
