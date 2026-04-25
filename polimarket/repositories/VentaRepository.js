// repositories/VentaRepository.js — Repository Pattern
const db = require('../db');

class VentaRepository {
  save(venta) {
    db.ventas.push(venta);
    return venta;
  }
  findById(id) {
    return db.ventas.find(v => v.id === id) || null;
  }
  findAll() {
    return db.ventas;
  }
  findByEstado(estado) {
    return db.ventas.filter(v => v.estado === estado);
  }
}

module.exports = new VentaRepository();
