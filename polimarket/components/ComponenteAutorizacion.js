// ComponenteAutorizacion — Recursos Humanos
// RF1: Autorizar vendedor para que pueda operar en el sistema

const db = require('../db');

const ComponenteAutorizacion = {

  // RF1: Autorizar un vendedor
  autorizarVendedor(vendedorId) {
    const vendedor = db.vendedores.find(v => v.id === vendedorId);
    if (!vendedor) {
      return { ok: false, mensaje: `Vendedor ${vendedorId} no encontrado.` };
    }
    if (vendedor.autorizado) {
      return { ok: false, mensaje: `El vendedor ${vendedor.nombre} ya está autorizado.` };
    }
    vendedor.autorizado = true;
    return { ok: true, mensaje: `Vendedor ${vendedor.nombre} autorizado correctamente.`, vendedor };
  },

  // Revocar autorización
  revocarAutorizacion(vendedorId) {
    const vendedor = db.vendedores.find(v => v.id === vendedorId);
    if (!vendedor) {
      return { ok: false, mensaje: `Vendedor ${vendedorId} no encontrado.` };
    }
    vendedor.autorizado = false;
    return { ok: true, mensaje: `Autorización de ${vendedor.nombre} revocada.` };
  },

  // Verificar si un vendedor está autorizado
  estaAutorizado(vendedorId) {
    const vendedor = db.vendedores.find(v => v.id === vendedorId);
    return vendedor ? vendedor.autorizado : false;
  },
};

module.exports = ComponenteAutorizacion;
