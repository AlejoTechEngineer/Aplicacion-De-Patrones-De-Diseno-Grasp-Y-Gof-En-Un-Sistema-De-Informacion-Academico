// components/EntregaFactory.js — Patrón Factory Method
// Centraliza la creación de los distintos tipos de entrega.
// Los clientes solo llaman crearEntrega(tipo) sin conocer las clases concretas.
const logger        = require('../utils/logger');
const entregaRepo   = require('../repositories/EntregaRepository');

const TIPOS_VALIDOS = ['domicilio', 'express'];

class EntregaDomicilio {
  constructor(ventaId, direccion) {
    this.id        = `ENT-${Date.now()}`;
    this.ventaId   = ventaId;
    this.tipo      = 'domicilio';
    this.direccion = direccion;
    this.estado    = 'pendiente';
    this.fecha     = new Date().toISOString();
  }
  registrarEntrega() {
    entregaRepo.save(this);
    logger.info(`[Factory] Entrega domicilio creada: ${this.id} → ${this.direccion}`);
    return { ok: true, entrega: this };
  }
  confirmarEntrega() {
    this.estado = 'entregado';
    return { ok: true, mensaje: 'Entrega domicilio confirmada.', entrega: this };
  }
}

class EntregaExpress {
  constructor(ventaId, tiempoMaximoHoras = 2) {
    this.id           = `ENT-${Date.now()}`;
    this.ventaId      = ventaId;
    this.tipo         = 'express';
    this.tiempoMaximo = tiempoMaximoHoras;
    this.estado       = 'pendiente';
    this.fecha        = new Date().toISOString();
  }
  registrarEntrega() {
    entregaRepo.save(this);
    logger.info(`[Factory] Entrega express creada: ${this.id} — ${this.tiempoMaximo}h máx`);
    return { ok: true, entrega: this };
  }
  confirmarEntrega() {
    this.estado = 'entregado';
    return { ok: true, mensaje: 'Entrega express confirmada.', entrega: this };
  }
}

class EntregaFactory {
  // Método de fábrica: decide qué clase concreta instanciar según el tipo
  static crearEntrega(tipo, ventaId, opciones = {}) {
    // Validación explícita antes del switch
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new Error(`[Factory] Tipo de entrega desconocido: "${tipo}"`);
    }
    switch (tipo) {
      case 'domicilio':
        return new EntregaDomicilio(ventaId, opciones.direccion || 'Sin dirección');
      case 'express':
        return new EntregaExpress(ventaId, opciones.tiempoMaximo || 2);
    }
  }
}

module.exports = EntregaFactory;
