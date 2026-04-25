// __tests__/observer.test.js — Pruebas para el Patrón Observer

const db        = require('../db');
const inventario = require('../components/ComponenteInventario');

beforeEach(() => {
  // Limpia observers para evitar efectos entre tests
  inventario._observadores = [];
  // Restaura stock de P1 a valor seguro
  const p1 = db.productos.find(p => p.id === 'P1');
  if (p1) p1.stock = 10;
});

describe('Patrón Observer — ComponenteInventario (Subject)', () => {
  test('agregarObservador registra el observer en la lista', () => {
    const mockObs = { actualizar: jest.fn(), constructor: { name: 'Mock' } };
    inventario.agregarObservador(mockObs);
    expect(inventario._observadores).toContain(mockObs);
  });

  test('removerObservador elimina el observer de la lista', () => {
    const mockObs = { actualizar: jest.fn(), constructor: { name: 'Mock' } };
    inventario.agregarObservador(mockObs);
    inventario.removerObservador(mockObs);
    expect(inventario._observadores).not.toContain(mockObs);
  });

  test('observer ES notificado cuando stock cae por debajo del mínimo (<=3)', () => {
    const mockObs = { actualizar: jest.fn(), constructor: { name: 'Mock' } };
    inventario.agregarObservador(mockObs);

    const p1 = db.productos.find(p => p.id === 'P1');
    p1.stock = 4; // stock actual: 4

    inventario.registrarSalida('P1', 2); // stock → 2 (por debajo del mínimo)

    expect(mockObs.actualizar).toHaveBeenCalledWith('P1', 2);
  });

  test('observer NO es notificado cuando stock se mantiene sobre el mínimo', () => {
    const mockObs = { actualizar: jest.fn(), constructor: { name: 'Mock' } };
    inventario.agregarObservador(mockObs);

    inventario.registrarSalida('P1', 1); // stock 10 → 9, sobre mínimo

    expect(mockObs.actualizar).not.toHaveBeenCalled();
  });

  test('múltiples observers son notificados al mismo tiempo', () => {
    const obs1 = { actualizar: jest.fn(), constructor: { name: 'Obs1' } };
    const obs2 = { actualizar: jest.fn(), constructor: { name: 'Obs2' } };
    inventario.agregarObservador(obs1);
    inventario.agregarObservador(obs2);

    const p1 = db.productos.find(p => p.id === 'P1');
    p1.stock = 4;
    inventario.registrarSalida('P1', 2);

    expect(obs1.actualizar).toHaveBeenCalled();
    expect(obs2.actualizar).toHaveBeenCalled();
  });
});
