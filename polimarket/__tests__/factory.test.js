// __tests__/factory.test.js — Pruebas para el Patrón Factory Method

const EntregaFactory = require('../components/EntregaFactory');
const db             = require('../db');

beforeEach(() => {
  db.entregas = [];
});

describe('Patrón Factory Method — EntregaFactory', () => {
  describe('crearEntrega("domicilio")', () => {
    test('crea instancia con tipo "domicilio"', () => {
      const entrega = EntregaFactory.crearEntrega('domicilio', 'VNT-001', { direccion: 'Calle 10 #5-20' });
      expect(entrega.tipo).toBe('domicilio');
    });

    test('asigna la dirección correctamente', () => {
      const entrega = EntregaFactory.crearEntrega('domicilio', 'VNT-001', { direccion: 'Av. 80 #12-30' });
      expect(entrega.direccion).toBe('Av. 80 #12-30');
    });

    test('usa "Sin dirección" como fallback si no se provee dirección', () => {
      const entrega = EntregaFactory.crearEntrega('domicilio', 'VNT-001', {});
      expect(entrega.direccion).toBe('Sin dirección');
    });
  });

  describe('crearEntrega("express")', () => {
    test('crea instancia con tipo "express"', () => {
      const entrega = EntregaFactory.crearEntrega('express', 'VNT-001', { tiempoMaximo: 3 });
      expect(entrega.tipo).toBe('express');
    });

    test('asigna tiempoMaximo correctamente', () => {
      const entrega = EntregaFactory.crearEntrega('express', 'VNT-001', { tiempoMaximo: 4 });
      expect(entrega.tiempoMaximo).toBe(4);
    });

    test('usa 2 horas como valor por defecto si no se provee tiempoMaximo', () => {
      const entrega = EntregaFactory.crearEntrega('express', 'VNT-001', {});
      expect(entrega.tiempoMaximo).toBe(2);
    });
  });

  describe('comportamientos comunes', () => {
    test('registrarEntrega() persiste la entrega en db.entregas', () => {
      const entrega = EntregaFactory.crearEntrega('domicilio', 'VNT-001', {});
      entrega.registrarEntrega();
      expect(db.entregas.length).toBe(1);
    });

    test('confirmarEntrega() cambia el estado a "entregado"', () => {
      const entrega = EntregaFactory.crearEntrega('express', 'VNT-001', {});
      entrega.confirmarEntrega();
      expect(entrega.estado).toBe('entregado');
    });

    test('lanza error con tipo inválido (validación includes)', () => {
      expect(() => EntregaFactory.crearEntrega('barco', 'VNT-001')).toThrow(
        '[Factory] Tipo de entrega desconocido: "barco"'
      );
    });
  });
});
