// Cliente 1: API REST — Express
// Expone los componentes de PoliMarket como endpoints HTTP
// Consume: RF1 (autorizarVendedor), RF2 (registrarVenta),
//          RF3 (verificarDisponibilidad), RF4 (reabastecimiento), RF5 (entregas)

const express = require('express');
const path    = require('path');
const app = express();
app.use(express.json());

// ── Sirve la interfaz web desde polimarket/public/ ──
app.use(express.static(path.join(__dirname, '../../public')));

const ComponenteAutorizacion     = require('../../components/ComponenteAutorizacion');
const ComponenteRegistroVentas   = require('../../components/ComponenteRegistroVentas');
const ComponenteInventario       = require('../../components/ComponenteInventario');
const ComponenteReabastecimiento = require('../../components/ComponenteReabastecimiento');
const ComponenteGestionEntregas  = require('../../components/ComponenteGestionEntregas');

// ── RF1: Autorizar vendedor ────────────────────────
app.post('/rrhh/autorizar', (req, res) => {
  const { vendedorId } = req.body;
  const resultado = ComponenteAutorizacion.autorizarVendedor(vendedorId);
  res.json(resultado);
});

app.post('/rrhh/revocar', (req, res) => {
  const { vendedorId } = req.body;
  const resultado = ComponenteAutorizacion.revocarAutorizacion(vendedorId);
  res.json(resultado);
});

// ── RF2: Registrar venta ───────────────────────────
app.post('/ventas/registrar', (req, res) => {
  const { vendedorId, clienteId, productosIds } = req.body;
  const resultado = ComponenteRegistroVentas.registrarVenta(vendedorId, clienteId, productosIds);
  res.json(resultado);
});

app.get('/ventas', (req, res) => {
  res.json(ComponenteRegistroVentas.listarVentas());
});

app.get('/ventas/clientes', (req, res) => {
  res.json(ComponenteRegistroVentas.listarClientes());
});

// ── RF3: Verificar disponibilidad ─────────────────
app.get('/bodega/disponibilidad/:productoId', (req, res) => {
  const resultado = ComponenteInventario.verificarDisponibilidad(req.params.productoId);
  res.json(resultado);
});

app.get('/bodega/inventario', (req, res) => {
  res.json(ComponenteInventario.listarInventario());
});

// ── RF4: Reabastecimiento ─────────────────────────
app.post('/bodega/reabastecer', (req, res) => {
  const { productoId, proveedorId, cantidad } = req.body;
  const resultado = ComponenteReabastecimiento.solicitarReabastecimiento(productoId, proveedorId, cantidad);
  res.json(resultado);
});

app.get('/bodega/stock-bajo', (req, res) => {
  res.json(ComponenteReabastecimiento.verificarStockBajo());
});

// ── RF5: Entregas ─────────────────────────────────
app.post('/entregas/registrar', (req, res) => {
  const { ventaId } = req.body;
  const resultado = ComponenteGestionEntregas.registrarEntrega(ventaId);
  res.json(resultado);
});

app.get('/entregas/pendientes', (req, res) => {
  res.json(ComponenteGestionEntregas.consultarPedidosPendientes());
});

app.get('/entregas', (req, res) => {
  res.json(ComponenteGestionEntregas.listarEntregas());
});

// ── Inicio del servidor ───────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`PoliMarket API corriendo en http://localhost:${PORT}`);
  console.log(`Interfaz web en       http://localhost:${PORT}/index.html`);
});

module.exports = app;