// repositories/VendedorRepository.js — Repository Pattern
const db = require('../db');

class VendedorRepository {
  findById(id) {
    return db.vendedores.find(v => v.id === id) || null;
  }
  findAll() {
    return db.vendedores;
  }
}

module.exports = new VendedorRepository();
