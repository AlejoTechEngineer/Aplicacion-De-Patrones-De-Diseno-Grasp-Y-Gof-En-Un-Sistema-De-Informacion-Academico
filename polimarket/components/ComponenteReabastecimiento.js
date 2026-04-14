// ComponenteReabastecimiento — Bodega + Proveedores
// RF4: Solicitar reabastecimiento cuando el stock es bajo

const db = require('../db');
const ComponenteInventario = require('./ComponenteInventario');

const STOCK_MINIMO = 3;

const ComponenteReabastecimiento = {

  // RF4: Solicitar reabastecimiento a proveedor
  solicitarReabastecimiento(productoId, proveedorId, cantidad) {
    const producto = db.productos.find(p => p.id === productoId);
    if (!producto) {
      return { ok: false, mensaje: `Producto ${productoId} no encontrado.` };
    }

    const proveedor = db.proveedores.find(p => p.id === proveedorId);
    if (!proveedor) {
      return { ok: false, mensaje: `Proveedor ${proveedorId} no encontrado.` };
    }

    if (producto.stock >= STOCK_MINIMO) {
      return {
        ok: false,
        mensaje: `Stock de ${producto.nombre} suficiente (${producto.stock} unidades). No se requiere reabastecimiento.`,
      };
    }

    // Registrar el pedido
    const pedido = {
      id: `PED${Date.now()}`,
      productoId,
      proveedorId,
      cantidad,
      fecha: new Date().toISOString(),
      estado: 'solicitado',
    };
    db.pedidos.push(pedido);

    // Simular recepción inmediata del pedido
    ComponenteInventario.registrarEntrada(productoId, cantidad);
    pedido.estado = 'recibido';

    return {
      ok: true,
      mensaje: `Reabastecimiento de ${producto.nombre} solicitado a ${proveedor.nombre}. Nuevo stock: ${producto.stock}`,
      pedido,
    };
  },

  // Verificar productos con stock bajo
  verificarStockBajo() {
    const bajoStock = db.productos.filter(p => p.stock < STOCK_MINIMO);
    return {
      ok: true,
      mensaje: bajoStock.length === 0 ? 'Todos los productos tienen stock suficiente.' : `${bajoStock.length} producto(s) con stock bajo.`,
      productos: bajoStock,
    };
  },

  // Listar proveedores
  listarProveedores() {
    return { ok: true, proveedores: db.proveedores };
  },

  // Listar pedidos realizados
  listarPedidos() {
    return { ok: true, pedidos: db.pedidos };
  },
};

module.exports = ComponenteReabastecimiento;
