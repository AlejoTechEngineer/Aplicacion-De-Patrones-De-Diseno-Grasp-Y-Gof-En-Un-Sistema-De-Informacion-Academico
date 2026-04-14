// ComponenteRegistroVentas — Ventas
// RF2: Registrar una venta con cliente y productos
// RF3: Verificar disponibilidad en bodega antes de vender

const db = require('../db');
const ComponenteAutorizacion = require('./ComponenteAutorizacion');
const ComponenteInventario = require('./ComponenteInventario');

const ComponenteRegistroVentas = {

  // RF2: Registrar una venta
  registrarVenta(vendedorId, clienteId, productosIds) {
    // Verificar que el vendedor esté autorizado
    if (!ComponenteAutorizacion.estaAutorizado(vendedorId)) {
      return { ok: false, mensaje: 'El vendedor no está autorizado para realizar ventas.' };
    }

    const cliente = db.clientes.find(c => c.id === clienteId);
    if (!cliente) {
      return { ok: false, mensaje: `Cliente ${clienteId} no encontrado.` };
    }

    // RF3: Verificar disponibilidad de cada producto en bodega
    const productosVenta = [];
    for (const pid of productosIds) {
      const disponibilidad = ComponenteInventario.verificarDisponibilidad(pid);
      if (!disponibilidad.ok) {
        return { ok: false, mensaje: disponibilidad.mensaje };
      }
      productosVenta.push(disponibilidad.producto);
    }

    // Calcular total
    const total = productosVenta.reduce((sum, p) => sum + p.precio, 0);

    // Crear venta
    const venta = {
      id: `VTA${Date.now()}`,
      fecha: new Date().toISOString(),
      vendedorId,
      clienteId,
      productos: productosVenta.map(p => p.id),
      total,
      estado: 'pendiente',
    };

    // Descontar stock de cada producto
    for (const p of productosVenta) {
      ComponenteInventario.registrarSalida(p.id, 1);
    }

    db.ventas.push(venta);
    return { ok: true, mensaje: 'Venta registrada exitosamente.', venta };
  },

  // Obtener detalle de una venta
  getDetalle(ventaId) {
    const venta = db.ventas.find(v => v.id === ventaId);
    if (!venta) return { ok: false, mensaje: 'Venta no encontrada.' };
    return { ok: true, venta };
  },

  // Listar todas las ventas
  listarVentas() {
    return { ok: true, ventas: db.ventas };
  },

  // Listar clientes disponibles
  listarClientes() {
    return { ok: true, clientes: db.clientes };
  },

  // Listar productos disponibles
  listarProductosDisponibles() {
    const disponibles = db.productos.filter(p => p.stock > 0);
    return { ok: true, productos: disponibles };
  },
};

module.exports = ComponenteRegistroVentas;
