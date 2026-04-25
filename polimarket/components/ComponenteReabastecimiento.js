// components/ComponenteReabastecimiento.js — Patrón Observer (Observer concreto)
// Implementa la interfaz Observer: reacciona automáticamente cuando
// ComponenteInventario notifica un nivel bajo de stock.
const logger       = require('../utils/logger');
const productoRepo = require('../repositories/ProductoRepository');
const pedidoRepo   = require('../repositories/PedidoRepository');
const db           = require('../db');

const STOCK_MINIMO = 3;

class ComponenteReabastecimiento {
  // Método requerido por el contrato Observer
  actualizar(productoId, stock) {
    logger.info(`[Reabastecimiento] Notificación recibida — Producto: ${productoId}, Stock: ${stock}`);
    return this.solicitarReabastecimiento(productoId, 'PROV-1', 20);
  }

  solicitarReabastecimiento(productoId, proveedorId, cantidad) {
    const producto  = productoRepo.findById(productoId);
    const proveedor = db.proveedores.find(p => p.id === proveedorId);

    if (!producto)  return { ok: false, mensaje: 'Producto no encontrado.' };
    if (!proveedor) return { ok: false, mensaje: 'Proveedor no encontrado.' };

    const pedido = {
      id:          `PED-${Date.now()}`,
      productoId,
      proveedorId,
      cantidad,
      estado:      'solicitado',
      fecha:       new Date().toISOString(),
    };

    pedidoRepo.save(pedido);

    logger.info(`[Reabastecimiento] Pedido generado: ${pedido.id} — ${cantidad} unidades de ${producto.nombre}`);
    return { ok: true, mensaje: 'Reabastecimiento solicitado.', pedido };
  }

  verificarStockBajo() {
    const bajoStock = productoRepo.findBelowStock(STOCK_MINIMO);
    return {
      ok: true,
      mensaje: bajoStock.length === 0
        ? 'Todos los productos tienen stock suficiente.'
        : `${bajoStock.length} producto(s) con stock bajo.`,
      productos: bajoStock,
    };
  }

  consultarProveedores() {
    return { ok: true, proveedores: db.proveedores };
  }

  listarProveedores() {
    return { ok: true, proveedores: db.proveedores };
  }

  listarPedidos() {
    return { ok: true, pedidos: pedidoRepo.findAll() };
  }
}

module.exports = new ComponenteReabastecimiento();
