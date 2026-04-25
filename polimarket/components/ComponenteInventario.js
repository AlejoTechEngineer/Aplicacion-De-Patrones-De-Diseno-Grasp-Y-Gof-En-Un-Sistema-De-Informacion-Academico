// components/ComponenteInventario.js — Patrón Observer (Subject)
// ComponenteInventario actúa como Subject: mantiene una lista de observers
// y los notifica automáticamente cuando el stock cae por debajo del mínimo.
const logger       = require('../utils/logger');
const productoRepo = require('../repositories/ProductoRepository');

const STOCK_MINIMO = 3;

class ComponenteInventario {
  constructor() {
    this._observadores = [];
  }

  agregarObservador(observer) {
    this._observadores.push(observer);
    logger.info(`[Inventario] Observer registrado: ${observer.constructor.name}`);
  }

  removerObservador(observer) {
    this._observadores = this._observadores.filter(o => o !== observer);
  }

  notificarObservadores(productoId, stock) {
    this._observadores.forEach(obs => obs.actualizar(productoId, stock));
  }

  verificarDisponibilidad(productoId) {
    const producto = productoRepo.findById(productoId);
    if (!producto) return { ok: false, mensaje: 'Producto no encontrado.' };
    return { ok: producto.stock > 0, stock: producto.stock, producto };
  }

  registrarEntrada(productoId, cantidad) {
    const producto = productoRepo.findById(productoId);
    if (!producto) return { ok: false, mensaje: 'Producto no encontrado.' };
    producto.stock += cantidad;
    return { ok: true, mensaje: `Entrada registrada. Stock actual: ${producto.stock}`, producto };
  }

  registrarSalida(productoId, cantidad) {
    const producto = productoRepo.findById(productoId);
    if (!producto) return { ok: false, mensaje: 'Producto no encontrado.' };
    if (producto.stock < cantidad) return { ok: false, mensaje: 'Stock insuficiente.' };

    producto.stock -= cantidad;

    if (producto.stock <= STOCK_MINIMO) {
      logger.warn(`[Inventario] Stock bajo detectado en ${productoId}: ${producto.stock} unidades`);
      this.notificarObservadores(productoId, producto.stock);
    }

    return { ok: true, mensaje: `Salida registrada. Stock actual: ${producto.stock}`, producto };
  }

  listarInventario() {
    return { ok: true, productos: productoRepo.findAll() };
  }
}

module.exports = new ComponenteInventario();
