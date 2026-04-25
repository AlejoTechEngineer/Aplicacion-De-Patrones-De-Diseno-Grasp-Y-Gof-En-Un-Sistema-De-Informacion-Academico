// components/ComponenteRegistroVentas.js — usa Patrón Strategy
// La estrategia de cálculo se inyecta, permitiendo cambiarla
// sin modificar este componente (principio Open/Closed).
const logger       = require('../utils/logger');
const productoRepo = require('../repositories/ProductoRepository');
const ventaRepo    = require('../repositories/VentaRepository');
const db           = require('../db');
const { EstandarStrategy } = require('./strategies/EstrategiaCalculo');

class ComponenteRegistroVentas {
  constructor(estrategia = new EstandarStrategy()) {
    this.estrategia = estrategia;
  }

  setEstrategia(estrategia) {
    this.estrategia = estrategia;
    logger.info(`[Ventas] Estrategia cambiada a: ${estrategia.constructor.name}`);
  }

  calcularTotal(productos) {
    return this.estrategia.calcular(productos);
  }

  registrarVenta(vendedorId, clienteId, productosIds) {
    const productos = productosIds.map(id => productoRepo.findById(id)).filter(Boolean);
    if (productos.length === 0) return { ok: false, mensaje: 'Ningún producto válido.' };

    const total = this.calcularTotal(productos);

    const venta = {
      id:          `VNT-${Date.now()}`,
      vendedorId,
      clienteId,
      productosIds,
      total,
      estado:      'pendiente',
      fecha:       new Date().toISOString(),
    };

    ventaRepo.save(venta);
    return { ok: true, mensaje: 'Venta registrada.', venta };
  }

  calcularTotalVenta(ventaId) {
    const venta = ventaRepo.findById(ventaId);
    if (!venta) return { ok: false, mensaje: 'Venta no encontrada.' };
    return { ok: true, total: venta.total };
  }

  getDetalle(ventaId) {
    const venta = ventaRepo.findById(ventaId);
    if (!venta) return { ok: false, mensaje: 'Venta no encontrada.' };
    return { ok: true, venta };
  }

  listarVentas() {
    return { ok: true, ventas: ventaRepo.findAll() };
  }

  listarClientes() {
    return { ok: true, clientes: db.clientes };
  }

  listarProductosDisponibles() {
    return { ok: true, productos: productoRepo.findAvailable() };
  }
}

module.exports = new ComponenteRegistroVentas();
