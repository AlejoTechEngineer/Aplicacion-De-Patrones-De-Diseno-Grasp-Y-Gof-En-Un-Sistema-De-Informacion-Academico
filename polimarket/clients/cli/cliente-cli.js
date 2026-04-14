#!/usr/bin/env node
// Cliente 2: CLI — Línea de comandos
// Plataforma diferente al cliente web (terminal vs HTTP)
// Consume: RF1 (autorizarVendedor), RF2 (registrarVenta),
//          RF3 (verificarDisponibilidad), RF5 (entregas)

const readline = require('readline');

const ComponenteAutorizacion     = require('../../components/ComponenteAutorizacion');
const ComponenteRegistroVentas   = require('../../components/ComponenteRegistroVentas');
const ComponenteInventario       = require('../../components/ComponenteInventario');
const ComponenteReabastecimiento = require('../../components/ComponenteReabastecimiento');
const ComponenteGestionEntregas  = require('../../components/ComponenteGestionEntregas');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const preguntar = (texto) =>
  new Promise((resolve) => rl.question(texto, resolve));

const separador = () => console.log('\n' + '─'.repeat(50));

const mostrarMenu = () => {
  separador();
  console.log('       POLIMARKET — SISTEMA DE GESTIÓN');
  separador();
  console.log('1. Autorizar vendedor         (RF1 - RRHH)');
  console.log('2. Registrar venta            (RF2 - Ventas)');
  console.log('3. Ver disponibilidad bodega  (RF3 - Bodega)');
  console.log('4. Solicitar reabastecimiento (RF4 - Bodega)');
  console.log('5. Registrar entrega          (RF5 - Entregas)');
  console.log('6. Ver inventario completo');
  console.log('7. Ver pedidos pendientes de entrega');
  console.log('0. Salir');
  separador();
};

const ejecutarOpcion = async (opcion) => {
  let resultado;

  switch (opcion.trim()) {

    // RF1: Autorizar vendedor
    case '1':
      console.log('\nVendedores disponibles:');
      console.log('  V001 - Carlos Ruiz');
      console.log('  V002 - Ana Gomez');
      const vId = await preguntar('ID del vendedor a autorizar: ');
      resultado = ComponenteAutorizacion.autorizarVendedor(vId.trim());
      console.log('\n' + (resultado.ok ? '✓' : '✗'), resultado.mensaje);
      break;

    // RF2: Registrar venta
    case '2':
      console.log('\nClientes disponibles:');
      ComponenteRegistroVentas.listarClientes().clientes.forEach(c =>
        console.log(`  ${c.id} - ${c.nombre}`)
      );
      const vendId  = await preguntar('ID del vendedor: ');
      const cliId   = await preguntar('ID del cliente: ');
      console.log('\nProductos disponibles:');
      ComponenteRegistroVentas.listarProductosDisponibles().productos.forEach(p =>
        console.log(`  ${p.id} - ${p.nombre} ($${p.precio.toLocaleString()}) — Stock: ${p.stock}`)
      );
      const prods = await preguntar('IDs de productos (separados por coma): ');
      const productosIds = prods.split(',').map(p => p.trim());
      resultado = ComponenteRegistroVentas.registrarVenta(vendId.trim(), cliId.trim(), productosIds);
      console.log('\n' + (resultado.ok ? '✓' : '✗'), resultado.mensaje);
      if (resultado.ok) {
        console.log('  ID Venta:', resultado.venta.id);
        console.log('  Total:   $' + resultado.venta.total.toLocaleString());
      }
      break;

    // RF3: Verificar disponibilidad
    case '3':
      console.log('\nProductos: P001 (Laptop HP), P002 (Mouse), P003 (Teclado)');
      const pId = await preguntar('ID del producto: ');
      resultado = ComponenteInventario.verificarDisponibilidad(pId.trim());
      console.log('\n' + (resultado.ok ? '✓' : '✗'), resultado.mensaje);
      break;

    // RF4: Reabastecimiento
    case '4':
      console.log('\nProductos con stock bajo:');
      const stockBajo = ComponenteReabastecimiento.verificarStockBajo();
      if (stockBajo.productos.length === 0) {
        console.log('  No hay productos con stock bajo.');
        break;
      }
      stockBajo.productos.forEach(p =>
        console.log(`  ${p.id} - ${p.nombre} (Stock: ${p.stock})`)
      );
      console.log('\nProveedores: PR001 (TechSupply), PR002 (DigitalParts)');
      const rpId  = await preguntar('ID del producto a reabastecer: ');
      const prId  = await preguntar('ID del proveedor: ');
      const cant  = await preguntar('Cantidad a solicitar: ');
      resultado = ComponenteReabastecimiento.solicitarReabastecimiento(
        rpId.trim(), prId.trim(), parseInt(cant)
      );
      console.log('\n' + (resultado.ok ? '✓' : '✗'), resultado.mensaje);
      break;

    // RF5: Registrar entrega
    case '5':
      const pendientes = ComponenteGestionEntregas.consultarPedidosPendientes();
      if (pendientes.ventas.length === 0) {
        console.log('\n  No hay ventas pendientes de entrega.');
        break;
      }
      console.log('\nVentas pendientes:');
      pendientes.ventas.forEach(v =>
        console.log(`  ${v.id} — Cliente: ${v.clienteId} — Total: $${v.total.toLocaleString()}`)
      );
      const vntId = await preguntar('ID de la venta a entregar: ');
      resultado = ComponenteGestionEntregas.registrarEntrega(vntId.trim());
      console.log('\n' + (resultado.ok ? '✓' : '✗'), resultado.mensaje);
      break;

    // Ver inventario
    case '6':
      console.log('\nInventario actual:');
      ComponenteInventario.listarInventario().productos.forEach(p =>
        console.log(`  ${p.id} - ${p.nombre} | Precio: $${p.precio.toLocaleString()} | Stock: ${p.stock}`)
      );
      break;

    // Pedidos pendientes
    case '7':
      const pend = ComponenteGestionEntregas.consultarPedidosPendientes();
      console.log(`\n${pend.mensaje}`);
      pend.ventas.forEach(v =>
        console.log(`  ${v.id} — Cliente: ${v.clienteId} — $${v.total.toLocaleString()}`)
      );
      break;

    case '0':
      console.log('\nCerrando PoliMarket CLI. ¡Hasta luego!\n');
      rl.close();
      process.exit(0);

    default:
      console.log('\n  Opción no válida. Intente de nuevo.');
  }
};

const iniciar = async () => {
  console.log('\n  Bienvenido al sistema PoliMarket');
  while (true) {
    mostrarMenu();
    const opcion = await preguntar('Seleccione una opción: ');
    await ejecutarOpcion(opcion);
  }
};

iniciar();
