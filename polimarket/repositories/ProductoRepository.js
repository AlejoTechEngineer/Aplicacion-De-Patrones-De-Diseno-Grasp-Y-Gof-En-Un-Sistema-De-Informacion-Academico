// repositories/ProductoRepository.js — Repository Pattern
// Abstrae el acceso a datos de productos.
// Los componentes nunca acceden a db.productos directamente.
const db = require('../db');

class ProductoRepository {
  findById(id) {
    return db.productos.find(p => p.id === id) || null;
  }
  findAll() {
    return db.productos;
  }
  findAvailable() {
    return db.productos.filter(p => p.stock > 0);
  }
  findBelowStock(min) {
    return db.productos.filter(p => p.stock < min);
  }
}

module.exports = new ProductoRepository();
