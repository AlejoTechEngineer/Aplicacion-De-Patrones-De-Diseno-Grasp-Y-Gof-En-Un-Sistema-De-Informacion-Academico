# Guía de Inicio Rápido — PoliMarket

Instrucciones para clonar, instalar y ejecutar el proyecto en entorno local.

---

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|-------------|----------------|-----------|
| Node.js | 18.x o superior | `node -v` |
| npm | 9.x o superior | `npm -v` |
| Git | cualquier versión reciente | `git --version` |

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/AlejoTechEngineer/Aplicacion-De-Patrones-De-Diseno-Grasp-Y-Gof-En-Un-Sistema-De-Informacion-Academico.git

cd Aplicacion-De-Patrones-De-Diseno-Grasp-Y-Gof-En-Un-Sistema-De-Informacion-Academico
```

---

## 2. Instalar dependencias

```bash
cd polimarket
npm install
```

Esto instala:
- `express` — servidor HTTP
- `winston` — logger
- `jest` — framework de tests (devDependency)

---

## 3. Ejecutar el servidor web

```bash
npm run start:web
```

El servidor inicia en **http://localhost:3000**

Salida esperada en consola:
```
PoliMarket API corriendo en http://localhost:3000
Interfaz web en       http://localhost:3000/index.html
```

---

## 4. Verificar que funciona

Abre el navegador en `http://localhost:3000/index.html` o prueba el primer endpoint con curl:

```bash
curl http://localhost:3000/bodega/inventario
```

Respuesta esperada:
```json
{
  "ok": true,
  "productos": [
    { "id": "P1", "nombre": "Laptop",  "precio": 2500000, "stock": 10 },
    { "id": "P2", "nombre": "Monitor", "precio": 800000,  "stock": 5  },
    { "id": "P3", "nombre": "Teclado", "precio": 150000,  "stock": 20 },
    { "id": "P4", "nombre": "Mouse",   "precio": 80000,   "stock": 15 }
  ]
}
```

---

## 5. Flujo completo de prueba (paso a paso)

### Paso 1 — Autorizar un vendedor

```bash
curl -X POST http://localhost:3000/rrhh/autorizar \
  -H "Content-Type: application/json" \
  -d '{ "vendedorId": "V1" }'
```

### Paso 2 — Registrar una venta (Facade — con estrategia automática)

```bash
curl -X POST http://localhost:3000/ventas/facade \
  -H "Content-Type: application/json" \
  -d '{
    "vendedorId":  "V1",
    "clienteId":   "C1",
    "productosIds": ["P1", "P2"]
  }'
```

> Con 4 productos o más se aplica automáticamente un **10% de descuento** (DescuentoStrategy).

```bash
curl -X POST http://localhost:3000/ventas/facade \
  -H "Content-Type: application/json" \
  -d '{
    "vendedorId":  "V1",
    "clienteId":   "C1",
    "productosIds": ["P1", "P2", "P3", "P4"]
  }'
```

### Paso 3 — Ver las ventas registradas

```bash
curl http://localhost:3000/ventas
```

### Paso 4 — Registrar una entrega

Copia el `id` de la venta del paso anterior y úsalo aquí:

```bash
curl -X POST http://localhost:3000/entregas/registrar \
  -H "Content-Type: application/json" \
  -d '{
    "ventaId": "VNT-XXXXXXXXX",
    "tipo":    "domicilio"
  }'
```

Tipos disponibles: `"domicilio"` o `"express"`

### Paso 5 — Ver stock bajo (Observer en acción)

Después de vender varios productos, el stock puede caer. El sistema notifica automáticamente al módulo de reabastecimiento:

```bash
curl http://localhost:3000/bodega/stock-bajo
```

---

## 6. Ejecutar el cliente CLI

En una terminal diferente (sin cerrar el servidor si lo necesitas):

```bash
npm run start:cli
```

Menú interactivo:
```
──────────────────────────────────────────────────
       POLIMARKET — SISTEMA DE GESTIÓN
──────────────────────────────────────────────────
1. Autorizar vendedor         (RF1 - RRHH)
2. Registrar venta            (RF2 - Ventas)
3. Ver disponibilidad bodega  (RF3 - Bodega)
4. Solicitar reabastecimiento (RF4 - Bodega)
5. Registrar entrega          (RF5 - Entregas)
6. Ver inventario completo
7. Ver pedidos pendientes de entrega
0. Salir
```

> El CLI trabaja directamente sobre los componentes en memoria, sin necesitar el servidor web activo.

---

## 7. Ejecutar los tests

```bash
npm test
```

Resultado esperado:
```
Test Suites: 5 passed, 5 total
Tests:       31 passed, 31 total
Time:        ~1s
```

Para modo vigilancia (re-ejecuta al guardar):

```bash
npm run test:watch
```

---

## 8. IDs de datos disponibles en memoria

| Tipo | IDs disponibles |
|------|----------------|
| Vendedores | `V1`, `V2`, `V3` |
| Clientes | `C1`, `C2` |
| Productos | `P1` (Laptop), `P2` (Monitor), `P3` (Teclado), `P4` (Mouse) |
| Proveedor | `PROV-1` |

> Los datos se reinician cada vez que se reinicia el servidor (base de datos en memoria).

---

## 9. Configurar nivel de logs

```bash
# Solo advertencias y errores
LOG_LEVEL=warn npm run start:web

# Todos los logs incluyendo debug
LOG_LEVEL=debug npm run start:web
```

---

## 10. Referencia rápida de endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/rrhh/autorizar` | Autoriza un vendedor |
| `POST` | `/rrhh/revocar` | Revoca autorización |
| `POST` | `/ventas/facade` | Registra venta completa (Facade) |
| `POST` | `/ventas/registrar` | Registra venta directa |
| `GET`  | `/ventas` | Lista todas las ventas |
| `GET`  | `/ventas/clientes` | Lista clientes |
| `GET`  | `/bodega/inventario` | Inventario completo |
| `GET`  | `/bodega/disponibilidad/:id` | Stock de un producto |
| `GET`  | `/bodega/stock-bajo` | Productos con stock bajo |
| `POST` | `/bodega/reabastecer` | Reabastecimiento manual |
| `POST` | `/entregas/registrar` | Registra entrega |
| `GET`  | `/entregas/pendientes` | Entregas pendientes |
| `GET`  | `/entregas` | Lista todas las entregas |

---

## Estructura de carpetas relevante

```
polimarket/
├── clients/web/servidor.js   ← API REST (puerto 3000)
├── clients/cli/cliente-cli.js← CLI interactivo
├── components/               ← Lógica de negocio + patrones GoF
├── repositories/             ← Capa de acceso a datos
├── utils/logger.js           ← Logger winston
├── db.js                     ← BD en memoria (Singleton)
└── __tests__/                ← Suite Jest (31 tests)
```

---

> Para documentación completa del proyecto, arquitectura y patrones GoF implementados, ver [README.md](README.md).
