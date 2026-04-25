// components/ComponenteGestionEntregas.js — usa Patrón Factory Method
// Delega la creación de entregas a EntregaFactory, sin instanciar
// directamente las clases concretas de entrega.
const ventaRepo    = require('../repositories/VentaRepository');
const entregaRepo  = require('../repositories/EntregaRepository');
const db           = require('../db');
const EntregaFactory = require('./EntregaFactory');

class ComponenteGestionEntregas {
  // tipo: 'domicilio' | 'express'
  registrarEntrega(ventaId, tipo = 'domicilio', opciones = {}) {
    const venta = ventaRepo.findById(ventaId);
    if (!venta) return { ok: false, mensaje: 'Venta no encontrada.' };

    if (venta.estado === 'entregado') {
      return { ok: false, mensaje: `La venta ${ventaId} ya fue entregada.` };
    }

    if (tipo === 'domicilio' && !opciones.direccion) {
      const cliente = db.clientes.find(c => c.id === venta.clienteId);
      opciones.direccion = cliente ? cliente.direccion : 'Sin dirección';
    }

    // Factory Method crea el tipo correcto de entrega
    const entrega = EntregaFactory.crearEntrega(tipo, ventaId, opciones);
    const resultado = entrega.registrarEntrega();

    venta.estado = 'en despacho';
    return resultado;
  }

  confirmarEntrega(entregaId) {
    const entrega = entregaRepo.findById(entregaId);
    if (!entrega) return { ok: false, mensaje: 'Entrega no encontrada.' };
    return entrega.confirmarEntrega();
  }

  consultarPedidosPendientes() {
    const pendientes = ventaRepo.findByEstado('pendiente');
    return { ok: true, pendientes };
  }

  listarEntregas() {
    return { ok: true, entregas: entregaRepo.findAll() };
  }

  registrarSalidaBodega(productoId, cantidad) {
    const ComponenteInventario = require('./ComponenteInventario');
    return ComponenteInventario.registrarSalida(productoId, cantidad);
  }
}

module.exports = new ComponenteGestionEntregas();
