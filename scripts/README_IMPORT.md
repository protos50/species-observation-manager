# 📥 Scripts de Importación de Datos

Scripts para poblar la base de datos con datos iniciales del laboratorio.

## 🔧 Requisitos

```bash
pip install pandas psycopg2-binary bcrypt openpyxl
```

⚠️ **Nota:** Se necesita `openpyxl` para leer archivos Excel (.xlsx)

## 📋 Orden de Ejecución

### 0️⃣ Limpiar Base de Datos (Opcional)

Si necesitás empezar desde cero o hacer pruebas, primero limpiá la base de datos:

```bash
# Limpiar TODO excepto usuarios (recomendado)
python3 scripts/clean_database.py

# Limpiar TODO incluyendo usuarios
python3 scripts/clean_database.py --clean-all

# Limpiar pero mantener los IDs actuales
python3 scripts/clean_database.py --no-reset-ids
```

**Características:**
- ✅ Elimina todos los datos respetando FK constraints
- ✅ Reinicia secuencias de IDs a 1
- ✅ Opción de mantener usuarios (para no perder admin)
- ✅ Muestra resumen de registros eliminados

---

### 1️⃣ Crear Usuario Administrador

**PRIMERO** crea un usuario admin para poder loguearte en la aplicación:

```bash
python3 scripts/create_admin_user.py
```

**Credenciales creadas:**
- 📧 Email: `admin@gema.com`
- 🔑 Password: `admin123`
- 🛡️  Rol: ADMIN

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

---

### 2️⃣ Importar Datos del Excel

Importa todos los registros de observaciones desde el archivo Excel del laboratorio:

```bash
python3 scripts/import_csv_data.py
```

⚠️ **Archivo fuente:** `/home/francojzini/Documents/Proyecto_Final/WZNHbvR.xlsx`

**El script importa:**
- ✅ Jerarquía geográfica (País → Provincia → Departamento → Localidad)
- ✅ Jerarquía taxonómica (Kingdom → Family → Subfamily → Tribe → Genus → Species)
- ✅ Personas (colectores/identificadores)
- ✅ Trampas
- ✅ Métodos de preservación
- ✅ Ambientes
- ✅ Castas
- ✅ Geolocalizaciones (con coordenadas GPS + IHH + distancia al río)
- ✅ Colecciones (con número de trampa)
- ✅ Observaciones (con todos los campos nuevos)

**Campos del CSV mapeados:**

| Campo CSV | Tabla | Campo DB |
|-----------|-------|----------|
| `provincia` | Province | `province_name` |
| `departamento` | Department | `department_name` |
| `localidad` | Locality | `locality_name` |
| `fecha_de_colecta` | Collection | `collection_date` |
| `recolector` | Person | `person_name`, `person_lastname` |
| `tipo_de_trampa` | Trap | `trap_name` |
| `nro_trampa` | Collection | `trap_number` ⭐ NUEVO |
| `met_cons` | PreservationMethod | `method_name` |
| `ambiente` | Environment | `environment_name` ⭐ NUEVO |
| `subfamilia` | Taxon | `name` (Subfamily) |
| `tribu` | Taxon | `name` (Tribe) |
| `genero` | Taxon | `name` (Genus) |
| `especie` | Taxon | `name` (Species) |
| `casta` | Caste | `caste_name` ⭐ NUEVO |
| `abundancia` | Observation | `abundance` ⭐ NUEVO |
| `latitud` | Geolocation | `latitude` |
| `longitud` | Geolocation | `longitude` |
| `altitud` | Geolocation | `altitude` |
| `obt_gps` | Geolocation | `source_type` |
| `ihh` | Geolocation | `ihh` ⭐ NUEVO |
| `dist_al_rio` | Geolocation | `distance_to_river` ⭐ NUEVO |
| `biologia` | Observation | `biology_notes` ⭐ NUEVO |
| `observaciones` | Observation | `general_observations` ⭐ NUEVO |
| `estado_conservacion` | Observation | `conservation_status` ⭐ NUEVO |

---

## 📊 Salida Esperada

### create_admin_user.py
```
✅ Conectado a PostgreSQL
✅ Rol creado: ADMIN
✅ Rol creado: USER
✅ Rol creado: RESEARCHER
============================================================
✅ ¡Usuario administrador creado exitosamente!
============================================================
📧 Email: admin@gema.com
🔑 Password: admin123
👤 ID: 1
🛡️  Rol: ADMIN
============================================================
```

### import_csv_data.py
```
📥 Iniciando importación desde: /path/to/datos.csv
============================================================
📊 Total de registros a procesar: 1234
✅ Niveles taxonómicos configurados: 9
📈 Progreso: 0/1234 registros procesados...
✅ Importado: ABC123 - Pheidole sp.
✅ Importado: ABC124 - Solenopsis invicta
...
============================================================
📊 RESUMEN DE IMPORTACIÓN:
  ✅ Importados: 1200
  ⚠️ Saltados: 34
  ❌ Errores: 0
  📋 Total procesados: 1234
============================================================
✅ ¡Importación completada exitosamente!
🎉 Los datos están listos para usar en la aplicación
```

---

## 🔍 Verificación

Después de ejecutar los scripts, verifica en tu aplicación:

1. **Login funciona** con `admin@gema.com` / `admin123`
2. **Dashboard muestra datos** importados
3. **Módulo Observaciones** lista registros del CSV
4. **Módulo Ubicaciones** muestra provincias/departamentos/localidades
5. **Módulo Taxonomía** muestra jerarquía completa

---

## ⚠️ Notas Importantes

### Requisitos del Archivo Excel
- ✅ El archivo Excel debe tener **coordenadas GPS válidas** (latitud/longitud)
- ✅ Geolocation ahora es **OBLIGATORIO** (sin coordenadas se salta el registro)
- ✅ Los registros sin `latitud` o `longitud` aparecerán como "Saltados"
- ✅ El script detecta automáticamente formato Excel (.xlsx) o CSV

### Cambios del Modelo Nuevo
1. **LocalityEnvironment eliminado** - Environment ahora se relaciona directamente con Observation
2. **Geolocation requiere id_locality** - La localidad es obligatoria para crear coordenadas
3. **Nuevas tablas**: Author, Caste, ClimateData
4. **Nuevos campos en Observation**: abundance, caste, identifier, biology_notes, etc.
5. **Nuevos campos en Geolocation**: ihh, distance_to_river
6. **Nuevo campo en Collection**: trap_number

### Cache del Script
El script usa **caché en memoria** para evitar consultas repetidas:
- Países, provincias, departamentos, localidades
- Personas, trampas, métodos de preservación
- Taxones, ambientes, castas
- **Performance**: ~10x más rápido que sin caché

---

## 🐛 Troubleshooting

### "Error conectando a la base de datos"
```python
# Verifica DB_CONFIG en el script:
DB_CONFIG = {
    'host': 'localhost',
    'database': 'animal_register',
    'user': 'postgres',
    'password': 'postgres',
    'port': 5432
}
```

### "Archivo no encontrado"
```bash
# El script busca el archivo Excel en:
/home/francojzini/Documents/Proyecto_Final/WZNHbvR.xlsx

# Ajusta la ruta en main() si es necesario
```

### "Usuario admin ya existe"
Si el usuario ya fue creado, simplemente usa las credenciales existentes o elimínalo:
```sql
DELETE FROM "User" WHERE email = 'admin@gema.com';
```

### "Registros saltados"
Los registros se saltan si faltan campos obligatorios:
- Fecha de colecta
- Recolector
- Taxonomía (al menos Family)
- **Geolocalización (lat/lon)** ⭐ NUEVO REQUISITO
- Trampa
- Método de preservación

---

## 🚀 Siguiente Paso

Después de importar los datos:

```bash
# Iniciar el backend
cd BackendAPI
npm run start:dev

# Iniciar el frontend (en otra terminal)
cd proyecto
npm run dev
```

**Login:** `http://localhost:3000` con `admin@gema.com` / `admin123`

---

## 📝 Logs y Depuración

Para ver más detalles de la importación:
```bash
# Ejecutar con output completo
python3 scripts/import_csv_data.py 2>&1 | tee import_log.txt
```

---

**¿Problemas?** Revisa los errores mostrados al final del resumen de importación.
