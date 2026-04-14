// ComponenteGestionEntregas — Entregas
// RF5: Registrar entrega y descontar de bodega

const db = require('../db');
const ComponenteInventario = require('./ComponenteInventario');

const ComponenteGestionEntregas = {

  // RF5: Registrar una entrega
  registrarEntrega(ventaId) {
    const venta = db.ventas.find(v => v.id === ventaId);
    if (!venta) {
      return { ok: false, mensaje: `Venta ${ventaId} no encontrada.` };
    }
    if (venta.estado === 'entregado') {
      return { ok: false, mensaje: `La venta ${ventaId} ya fue entregada.` };
    }

    const cliente = db.clientes.find(c => c.id === venta.clienteId);

    const entrega = {
      id: `ENT${Date.now()}`,
      ventaId,
      clienteId: venta.clienteId,
      direccionDestino: cliente ? cliente.direccion : 'Sin dirección',
      productos: venta.productos,
      fecha: new Date().toISOString(),
      estado: 'en camino',
    };

    db.entregas.push(entrega);
    venta.estado = 'entregado';

    return {
      ok: true,
      mensaje: `Entrega registrada para la venta ${ventaId} al cliente ${cliente?.nombre}.`,
      entrega,
    };
  },

  // Confirmar entrega completada
  confirmarEntrega(entregaId) {
    const entrega = db.entregas.find(e => e.id === entregaId);
    if (!entrega) {
      return { ok: false, mensaje: `Entrega ${entregaId} no encontrada.` };
    }
    entrega.estado = 'entregado';
    return { ok: true, mensaje: `Entrega ${entregaId} confirmada como entregada.`, entrega };
  },

  // Consultar pedidos pendientes de entrega
  consultarPedidosPendientes() {
    const pendientes = db.ventas.filter(v => v.estado === 'pendiente');
    return {
      ok: true,
      mensaje: `${pendientes.length} venta(s) pendiente(s) de entrega.`,
      ventas: pendientes,
    };
  },

  // Listar todas las entregas
  listarEntregas() {
    return { ok: true, entregas: db.entregas };
  },
};

module.exports = ComponenteGestionEntregas;
