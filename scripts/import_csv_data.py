#!/usr/bin/env python3
"""
Script para importar datos de Excel/CSV a PostgreSQL
Mapea datos biológicos de colecciones a las tablas del sistema
Soporta archivos .xlsx, .xls y .csv
"""

import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import sys
import os
import re
from typing import Dict, Set, Optional

# Configuración de base de datos
DB_CONFIG = {
    'host': 'localhost',
    'database': 'animal_register',
    'user': 'postgres',
    'password': 'postgres',
    'port': 5432
}

class DataImporter:
    def __init__(self):
        """Inicializa el importador con conexión a la base de datos"""
        self.conn = None
        self.cursor = None
        
        # Crear archivo de log con timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        log_dir = os.path.join(os.path.dirname(__file__), 'logs')
        os.makedirs(log_dir, exist_ok=True)
        self.log_file = os.path.join(log_dir, f'import_log_{timestamp}.txt')
        self.log_handle = open(self.log_file, 'w', encoding='utf-8')
        
        # Cache para evitar consultas repetidas
        self.cache = {
            'country': {},
            'province': {},
            'department': {},
            'locality': {},
            'person': {},
            'trap': {},
            'preservation_method': {},
            'taxon': {},
            'taxonomic_level': {},
            'environment': {},
            'caste': {},
            'author': {},
            'climate_data': {}  # Cache por (locality, date, valores)
        }
        
        # Contador de registros procesados
        self.stats = {
            'total': 0,
            'imported': 0,
            'skipped': 0,
            'errors': [],
            'warnings': []
        }
        
    def log(self, message, level='INFO', to_console=True):
        """Escribe mensaje en archivo de log y opcionalmente en consola"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] [{level}] {message}\n"
        self.log_handle.write(log_entry)
        self.log_handle.flush()
        
        if to_console:
            print(message)
    
    def connect(self):
        """Establece conexión con la base de datos"""
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            self.log("✅ Conectado a PostgreSQL exitosamente")
            return True
        except Exception as e:
            self.log(f"❌ Error conectando a PostgreSQL: {e}", 'ERROR')
            return False
    
    def disconnect(self):
        """Cierra la conexión con la base de datos y el archivo de log"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        if self.log_handle:
            self.log_handle.close()
        print("👋 Desconectado de PostgreSQL")
    
    def get_or_create_taxonomic_levels(self):
        """Crea o obtiene los niveles taxonómicos necesarios"""
        levels = [
            'Kingdom',
            'Phylum',
            'Class',
            'Order',
            'Family',
            'Subfamily',
            'Tribe',
            'Genus',
            'Species'
        ]
        
        for level_name in levels:
            # Verificar si existe
            self.cursor.execute(
                'SELECT id_taxonomic_level FROM public."TaxonomicLevel" WHERE name = %s',
                (level_name,)
            )
            result = self.cursor.fetchone()
            
            if result:
                self.cache['taxonomic_level'][level_name] = result['id_taxonomic_level']
            else:
                # Insertar nuevo nivel (sin level_order ya que no existe en el schema)
                self.cursor.execute(
                    '''INSERT INTO public."TaxonomicLevel" (name)
                       VALUES (%s) RETURNING id_taxonomic_level''',
                    (level_name,)
                )
                self.cache['taxonomic_level'][level_name] = self.cursor.fetchone()['id_taxonomic_level']
        
        self.conn.commit()
        print(f"✅ Niveles taxonómicos configurados: {len(self.cache['taxonomic_level'])}")
    
    def get_or_create_country(self):
        """Obtiene o crea Argentina como país por defecto"""
        name = 'Argentina'
        
        if name in self.cache['country']:
            return self.cache['country'][name]
        
        self.cursor.execute(
            'SELECT id_country FROM public."Country" WHERE country_name = %s',
            (name,)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['country'][name] = result['id_country']
        else:
            self.cursor.execute(
                'INSERT INTO public."Country" (country_name) VALUES (%s) RETURNING id_country',
                (name,)
            )
            self.cache['country'][name] = self.cursor.fetchone()['id_country']
            self.conn.commit()
        
        return self.cache['country'][name]
    
    def get_or_create_province(self, province_name):
        """Obtiene o crea una provincia"""
        if not province_name or pd.isna(province_name):
            return None
            
        if province_name in self.cache['province']:
            return self.cache['province'][province_name]
        
        id_country = self.get_or_create_country()
        
        self.cursor.execute(
            'SELECT id_province FROM public."Province" WHERE province_name = %s AND id_country = %s',
            (province_name, id_country)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['province'][province_name] = result['id_province']
        else:
            self.cursor.execute(
                'INSERT INTO public."Province" (province_name, id_country) VALUES (%s, %s) RETURNING id_province',
                (province_name, id_country)
            )
            self.cache['province'][province_name] = self.cursor.fetchone()['id_province']
            self.conn.commit()
        
        return self.cache['province'][province_name]
    
    def get_or_create_department(self, department_name, province_name):
        """Obtiene o crea un departamento"""
        if not department_name or pd.isna(department_name):
            return None
            
        key = f"{province_name}_{department_name}"
        if key in self.cache['department']:
            return self.cache['department'][key]
        
        id_province = self.get_or_create_province(province_name)
        if not id_province:
            return None
        
        self.cursor.execute(
            'SELECT id_department FROM public."Department" WHERE department_name = %s AND id_province = %s',
            (department_name, id_province)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['department'][key] = result['id_department']
        else:
            self.cursor.execute(
                'INSERT INTO public."Department" (department_name, id_province) VALUES (%s, %s) RETURNING id_department',
                (department_name, id_province)
            )
            self.cache['department'][key] = self.cursor.fetchone()['id_department']
            self.conn.commit()
        
        return self.cache['department'][key]
    
    def get_or_create_locality(self, locality_name, department_name, province_name):
        """Obtiene o crea una localidad"""
        if not locality_name or pd.isna(locality_name):
            return None
            
        key = f"{province_name}_{department_name}_{locality_name}"
        if key in self.cache['locality']:
            return self.cache['locality'][key]
        
        id_department = self.get_or_create_department(department_name, province_name)
        if not id_department:
            return None
        
        self.cursor.execute(
            'SELECT id_locality FROM public."Locality" WHERE locality_name = %s AND id_department = %s',
            (locality_name, id_department)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['locality'][key] = result['id_locality']
        else:
            self.cursor.execute(
                'INSERT INTO public."Locality" (locality_name, id_department) VALUES (%s, %s) RETURNING id_locality',
                (locality_name, id_department)
            )
            self.cache['locality'][key] = self.cursor.fetchone()['id_locality']
            self.conn.commit()
        
        return self.cache['locality'][key]
    
    def get_or_create_person(self, person_str):
        """Crea o obtiene un colector/persona (wrapper para get_or_create_person_by_name)"""
        return self.get_or_create_person_by_name(person_str)
    
    def get_or_create_trap(self, trap_name):
        """Obtiene o crea un tipo de trampa"""
        if not trap_name or pd.isna(trap_name):
            return None
            
        if trap_name in self.cache['trap']:
            return self.cache['trap'][trap_name]
        
        self.cursor.execute(
            'SELECT id_trap FROM public."Trap" WHERE trap_name = %s',
            (trap_name,)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['trap'][trap_name] = result['id_trap']
        else:
            self.cursor.execute(
                'INSERT INTO public."Trap" (trap_name) VALUES (%s) RETURNING id_trap',
                (trap_name,)
            )
            self.cache['trap'][trap_name] = self.cursor.fetchone()['id_trap']
            self.conn.commit()
        
        return self.cache['trap'][trap_name]
    
    def get_or_create_preservation_method(self, method_name):
        """Obtiene o crea un método de preservación"""
        if not method_name or pd.isna(method_name):
            return None
            
        if method_name in self.cache['preservation_method']:
            return self.cache['preservation_method'][method_name]
        
        self.cursor.execute(
            'SELECT id_preservation_method FROM public."PreservationMethod" WHERE method_name = %s',
            (method_name,)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['preservation_method'][method_name] = result['id_preservation_method']
        else:
            self.cursor.execute(
                'INSERT INTO public."PreservationMethod" (method_name) VALUES (%s) RETURNING id_preservation_method',
                (method_name,)
            )
            self.cache['preservation_method'][method_name] = self.cursor.fetchone()['id_preservation_method']
            self.conn.commit()
        
        return self.cache['preservation_method'][method_name]
    
    def get_or_create_environment(self, env_name):
        """Obtiene o crea un ambiente"""
        if not env_name or pd.isna(env_name):
            return None
            
        if env_name in self.cache['environment']:
            return self.cache['environment'][env_name]
        
        self.cursor.execute(
            'SELECT id_environment FROM public."Environment" WHERE environment_name = %s',
            (env_name,)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['environment'][env_name] = result['id_environment']
        else:
            self.cursor.execute(
                'INSERT INTO public."Environment" (environment_name) VALUES (%s) RETURNING id_environment',
                (env_name,)
            )
            self.cache['environment'][env_name] = self.cursor.fetchone()['id_environment']
            self.conn.commit()
        
        return self.cache['environment'][env_name]
    
    def get_or_create_caste(self, caste_name):
        """Obtiene o crea una casta"""
        if not caste_name or pd.isna(caste_name):
            return None
            
        if caste_name in self.cache['caste']:
            return self.cache['caste'][caste_name]
        
        self.cursor.execute(
            'SELECT id_caste FROM public."Caste" WHERE caste_name = %s',
            (caste_name,)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['caste'][caste_name] = result['id_caste']
        else:
            self.cursor.execute(
                'INSERT INTO public."Caste" (caste_name) VALUES (%s) RETURNING id_caste',
                (caste_name,)
            )
            self.cache['caste'][caste_name] = self.cursor.fetchone()['id_caste']
            self.conn.commit()
        
        return self.cache['caste'][caste_name]
    
    def get_or_create_author(self, author_name, year=None):
        """Obtiene o crea un autor (año se guarda en Taxon.description_year, no aquí)"""
        if not author_name or pd.isna(author_name):
            return None
        
        author_name = str(author_name).strip()
        
        if author_name in self.cache['author']:
            return self.cache['author'][author_name]
        
        self.cursor.execute(
            'SELECT id_author FROM public."Author" WHERE author_name = %s',
            (author_name,)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['author'][author_name] = result['id_author']
        else:
            self.cursor.execute(
                'INSERT INTO public."Author" (author_name) VALUES (%s) RETURNING id_author',
                (author_name,)
            )
            self.cache['author'][author_name] = self.cursor.fetchone()['id_author']
            self.conn.commit()
        
        return self.cache['author'][author_name]
    
    def get_or_create_person_by_name(self, person_str):
        """Crea o obtiene una persona dado un string con formato 'Apellido, Nombre'"""
        if not person_str or pd.isna(person_str):
            return None
        
        person_str = str(person_str).strip()
        
        # Extraer apellido y nombre
        parts = person_str.split(',')
        if len(parts) == 2:
            last_name = parts[0].strip()
            first_name = parts[1].strip()
        else:
            last_name = person_str
            first_name = ''
        
        # Verificar caché
        cache_key = f"{first_name}|{last_name}"
        if cache_key in self.cache['person']:
            return self.cache['person'][cache_key]
        
        # Buscar en base de datos
        self.cursor.execute(
            'SELECT id_person FROM public."Person" WHERE person_name = %s AND person_lastname = %s',
            (first_name, last_name)
        )
        result = self.cursor.fetchone()
        
        if result:
            self.cache['person'][cache_key] = result['id_person']
        else:
            # Insertar nueva persona
            self.cursor.execute(
                'INSERT INTO public."Person" (person_name, person_lastname) VALUES (%s, %s) RETURNING id_person',
                (first_name, last_name)
            )
            self.cache['person'][cache_key] = self.cursor.fetchone()['id_person']
            self.conn.commit()  # ✅ COMMIT AGREGADO
        
        return self.cache['person'][cache_key]
    
    def get_or_create_taxon(self, name, level_name, parent_id=None, id_author=None, description_year=None):
        """Obtiene o crea un taxón con autor y año de descripción opcional"""
        if not name or pd.isna(name):
            return None
        
        # Limpiar description_year
        year_val = None
        if description_year and not pd.isna(description_year):
            try:
                year_val = int(description_year)
            except:
                year_val = None
            
        key = f"{level_name}_{name}_{parent_id}_{id_author}_{year_val}"
        if key in self.cache['taxon']:
            return self.cache['taxon'][key]
        
        level_id = self.cache['taxonomic_level'].get(level_name)
        if not level_id:
            return None
        
        # Buscar taxón existente (sin considerar autor/año para la búsqueda)
        if parent_id:
            self.cursor.execute(
                'SELECT id_taxon FROM public."Taxon" WHERE name = %s AND id_taxonomic_level = %s AND parent_id = %s',
                (name, level_id, parent_id)
            )
        else:
            self.cursor.execute(
                'SELECT id_taxon FROM public."Taxon" WHERE name = %s AND id_taxonomic_level = %s AND parent_id IS NULL',
                (name, level_id)
            )
        
        result = self.cursor.fetchone()
        
        if result:
            # Si existe, actualizar autor y año si no los tenía
            id_taxon = result['id_taxon']
            if id_author or year_val:
                update_parts = []
                update_values = []
                if id_author:
                    update_parts.append('id_author = %s')
                    update_values.append(id_author)
                if year_val:
                    update_parts.append('description_year = %s')
                    update_values.append(year_val)
                
                if update_parts:
                    update_values.append(id_taxon)
                    self.cursor.execute(
                        f'UPDATE public."Taxon" SET {", ".join(update_parts)} WHERE id_taxon = %s AND (id_author IS NULL OR description_year IS NULL)',
                        tuple(update_values)
                    )
                    self.conn.commit()
            self.cache['taxon'][key] = id_taxon
        else:
            # Insertar nuevo taxón con autor y año
            if parent_id:
                self.cursor.execute(
                    'INSERT INTO public."Taxon" (name, id_taxonomic_level, parent_id, id_author, description_year) VALUES (%s, %s, %s, %s, %s) RETURNING id_taxon',
                    (name, level_id, parent_id, id_author, year_val)
                )
            else:
                self.cursor.execute(
                    'INSERT INTO public."Taxon" (name, id_taxonomic_level, id_author, description_year) VALUES (%s, %s, %s, %s) RETURNING id_taxon',
                    (name, level_id, id_author, year_val)
                )
            self.cache['taxon'][key] = self.cursor.fetchone()['id_taxon']
            self.conn.commit()
        
        return self.cache['taxon'][key]
    
    def parse_altitude(self, alt_value):
        """Parsea altitud extrayendo solo números (maneja casos como '52 msn', '100m', etc.)"""
        if pd.isna(alt_value):
            return None
        
        # Si ya es un número, retornarlo
        if isinstance(alt_value, (int, float)):
            return float(alt_value)
        
        # Si es string, extraer solo números
        if isinstance(alt_value, str):
            # Buscar números (incluyendo decimales)
            match = re.search(r'[-+]?\d*\.?\d+', str(alt_value))
            if match:
                try:
                    return float(match.group())
                except:
                    return None
        
        return None
    
    def create_geolocation(self, lat, lon, alt, source_type, id_locality, ihh=None, distance_to_river=None):
        """Crea una geolocalización con id_locality obligatorio"""
        if pd.isna(lat) or pd.isna(lon) or not id_locality:
            return None
        
        # Parsear altitud (maneja strings como '52 msn')
        alt_value = self.parse_altitude(alt)
        
        # Establecer source_type por defecto si no existe
        if pd.isna(source_type):
            source_type = 'CSV Import'
        
        # Convertir campos opcionales
        ihh_val = None if pd.isna(ihh) else float(ihh)
        dist_val = None if pd.isna(distance_to_river) else float(distance_to_river)
        
        self.cursor.execute(
            '''INSERT INTO public."Geolocation" 
               (latitude, longitude, altitude, source_type, id_locality, ihh, distance_to_river)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id_geolocation''',
            (float(lat), float(lon), alt_value, source_type, id_locality, ihh_val, dist_val)
        )
        id_geolocation = self.cursor.fetchone()['id_geolocation']
        self.conn.commit()
        
        return id_geolocation
    
    def create_climate_data(self, row, id_locality=None, collection_date=None):
        """Obtiene o crea un registro de datos climáticos con localidad y fecha"""
        
        # Extraer campos climáticos del row
        t_min = None if pd.isna(row.get('t_min')) else float(row['t_min'])
        t_max = None if pd.isna(row.get('t_max')) else float(row['t_max'])
        t_med = None if pd.isna(row.get('t_med')) else float(row['t_med'])
        hr_min = None if pd.isna(row.get('hr_min')) else float(row['hr_min'])
        hr_max = None if pd.isna(row.get('hr_max')) else float(row['hr_max'])
        hr_med = None if pd.isna(row.get('hr_med')) else float(row['hr_med'])
        pp_14 = None if pd.isna(row.get('pp_14_dias_antes')) else float(row['pp_14_dias_antes'])
        pp_30 = None if pd.isna(row.get('pp_30_dias_antes')) else float(row['pp_30_dias_antes'])
        
        # Solo crear si hay al menos un dato climático
        if not any([t_min, t_max, t_med, hr_min, hr_max, hr_med, pp_14, pp_30]):
            return None
        
        # Crear clave de caché basada en localidad, fecha y valores climáticos
        cache_key = f"{id_locality}|{collection_date}|{t_min}|{t_max}|{t_med}|{hr_min}|{hr_max}|{hr_med}|{pp_14}|{pp_30}"
        
        # Verificar caché
        if cache_key in self.cache['climate_data']:
            return self.cache['climate_data'][cache_key]
        
        try:
            # Buscar en DB si ya existe con la misma localidad, fecha y valores
            self.cursor.execute(
                '''SELECT id_climate_data FROM public."ClimateData" 
                   WHERE id_locality = %s AND climate_date = %s
                   AND (t_min IS NOT DISTINCT FROM %s) 
                   AND (t_max IS NOT DISTINCT FROM %s)
                   AND (t_med IS NOT DISTINCT FROM %s)
                   AND (hr_min IS NOT DISTINCT FROM %s)
                   AND (hr_max IS NOT DISTINCT FROM %s)
                   AND (hr_med IS NOT DISTINCT FROM %s)
                   AND (pp_14_days_before IS NOT DISTINCT FROM %s)
                   AND (pp_30_days_before IS NOT DISTINCT FROM %s)''',
                (id_locality, collection_date, t_min, t_max, t_med, hr_min, hr_max, hr_med, pp_14, pp_30)
            )
            result = self.cursor.fetchone()
            
            if result:
                # Ya existe, reutilizar
                id_climate_data = result['id_climate_data']
            else:
                # Insertar nuevo con localidad y fecha
                self.cursor.execute(
                    '''INSERT INTO public."ClimateData" 
                       (id_locality, climate_date, t_min, t_max, t_med, hr_min, hr_max, hr_med, 
                        pp_14_days_before, pp_30_days_before)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id_climate_data''',
                    (id_locality, collection_date, t_min, t_max, t_med, hr_min, hr_max, hr_med, pp_14, pp_30)
                )
                id_climate_data = self.cursor.fetchone()['id_climate_data']
                self.conn.commit()
            
            # Guardar en caché
            self.cache['climate_data'][cache_key] = id_climate_data
            return id_climate_data
            
        except Exception as e:
            # Si falla, hacer rollback y continuar
            self.conn.rollback()
            print(f"  ⚠️  ClimateData no creado: {e}")
            return None
    
    def import_row(self, row):
        """Importa una fila completa del CSV"""
        try:
            # 1. Crear jerarquía geográfica
            id_locality = self.get_or_create_locality(
                row['localidad'],
                row['departamento'],
                row['provincia']
            )
            
            # 2. Crear persona (recolector)
            id_person = self.get_or_create_person(row.get('recolector'))
            
            # 3. Crear trampa
            id_trap = self.get_or_create_trap(row['tipo_de_trampa'])
            
            # 4. Crear método de preservación
            id_preservation = None
            if not pd.isna(row.get('met_cons')):
                id_preservation = self.get_or_create_preservation_method(row['met_cons'])
            else:
                # Valor por defecto si no se especifica
                id_preservation = self.get_or_create_preservation_method('Sin especificar')
            
            # 5. Crear autor si existe en el CSV
            id_author = self.get_or_create_author(row.get('autor'), row.get('año'))
            
            # 6. Crear jerarquía taxonómica
            # Orden: Kingdom → Family → Subfamily → Tribe → Genus → Species
            
            # Por ahora asumimos Kingdom: Animalia, Family: Formicidae (hormigas)
            id_kingdom = self.get_or_create_taxon('Animalia', 'Kingdom')
            id_family = self.get_or_create_taxon('Formicidae', 'Family', id_kingdom)
            
            # Subfamily
            id_subfamily = None
            if not pd.isna(row.get('subfamilia')):
                id_subfamily = self.get_or_create_taxon(row['subfamilia'], 'Subfamily', id_family)
            
            # Tribe
            id_tribe = None
            if not pd.isna(row.get('tribu')):
                parent = id_subfamily if id_subfamily else id_family
                id_tribe = self.get_or_create_taxon(row['tribu'], 'Tribe', parent)
            
            # Genus
            id_genus = None
            if not pd.isna(row.get('genero')):
                parent = id_tribe if id_tribe else (id_subfamily if id_subfamily else id_family)
                id_genus = self.get_or_create_taxon(row['genero'], 'Genus', parent)
            
            # Species (con autor y año de descripción)
            id_species = None
            if not pd.isna(row.get('especie')):
                parent = id_genus if id_genus else (id_tribe if id_tribe else (id_subfamily if id_subfamily else id_family))
                # Pasar id_author Y description_year del CSV
                id_species = self.get_or_create_taxon(row['especie'], 'Species', parent, id_author, row.get('año'))
            
            # Usar el taxón más específico disponible
            id_taxon = id_species or id_genus or id_tribe or id_subfamily or id_family
            
            # 6. Obtener ambiente del CSV
            id_environment = self.get_or_create_environment(row.get('ambiente'))
            
            # 7. Obtener casta del CSV
            id_caste = self.get_or_create_caste(row.get('casta'))
            
            # 8. Crear geolocalización CON id_locality obligatorio
            id_geolocation = None
            if not pd.isna(row.get('latitud')) and not pd.isna(row.get('longitud')) and id_locality:
                id_geolocation = self.create_geolocation(
                    row['latitud'],
                    row['longitud'],
                    row.get('altitud'),
                    row.get('obt_gps'),
                    id_locality,  # OBLIGATORIO ahora
                    row.get('ihh'),
                    row.get('dist_al_rio')
                )
            
            # 9. Validar que tenemos geolocalización (ahora es obligatorio)
            if not id_geolocation:
                msg = f"⚠️ Saltado {row['CODIGO']} - Falta geolocalización válida (lat/lon/locality)"
                self.log(msg, 'WARNING', to_console=False)
                self.stats['skipped'] += 1
                self.stats['warnings'].append(msg)
                return False
            
            # 10. Crear colección
            collection_date = pd.to_datetime(row['fecha_de_colecta']).date() if not pd.isna(row['fecha_de_colecta']) else None
            
            # Trap number del CSV
            trap_number = None if pd.isna(row.get('nro_trampa')) else int(row['nro_trampa'])
            
            if collection_date and id_person and id_preservation and id_trap:
                # Insertar colección directamente (sin función SQL)
                self.cursor.execute(
                    '''INSERT INTO public."Collection" 
                       (id_person, id_preservation_method, id_trap, collection_date, trap_number)
                       VALUES (%s, %s, %s, %s, %s) RETURNING id_collection''',
                    (id_person, id_preservation, id_trap, collection_date, trap_number)
                )
                id_collection = self.cursor.fetchone()['id_collection']
                
                # 11. Obtener abundancia del CSV
                abundance = None if pd.isna(row.get('abundancia')) else int(row['abundancia'])
                
                # 12. Obtener identificador del campo 'identificacion' (no 'confirmacion')
                id_identifier = None
                if not pd.isna(row.get('identificacion')):
                    id_identifier = self.get_or_create_person_by_name(row['identificacion'])
                else:
                    # Si no hay identificador explícito, usar el colector
                    id_identifier = id_person
                
                # 13. Fecha de identificación del CSV
                identification_date = None
                if not pd.isna(row.get('fecha_de_ident')):
                    identification_date = pd.to_datetime(row['fecha_de_ident']).date()
                else:
                    # Por defecto la fecha de colecta
                    identification_date = collection_date
                
                id_confirmer = None
                if not pd.isna(row.get('confirmacion')):
                    id_confirmer = self.get_or_create_person_by_name(row['confirmacion'])

                confirmation_date = None
                if not pd.isna(row.get('fecha_de_conf')):
                    confirmation_date = pd.to_datetime(row['fecha_de_conf']).date()
                
                # 14. Obtener notas biológicas y observaciones del CSV
                biology_notes = None if pd.isna(row.get('biologia')) else str(row['biologia'])
                general_observations = None if pd.isna(row.get('observaciones')) else str(row['observaciones'])
                conservation_status = None if pd.isna(row.get('estado_conservacion')) else str(row['estado_conservacion'])
                
                # 15. Crear datos climáticos ANTES de observation (para obtener id)
                # Ahora incluimos localidad y fecha para poder reutilizar datos climáticos
                id_climate_data = self.create_climate_data(row, id_locality, collection_date)
                
                # 16. Insertar observación directamente (sin función SQL) vinculada con ClimateData
                self.cursor.execute(
                    '''INSERT INTO public."Observation" 
                       (id_taxon, id_collection, id_geolocation, id_environment, id_caste, id_climate_data,
                        abundance, id_identifier, identification_date, id_confirmer, confirmation_date,
                        biology_notes, general_observations, conservation_status)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id_observation''',
                    (id_taxon, id_collection, id_geolocation, id_environment, id_caste, id_climate_data,
                     abundance, id_identifier, identification_date, id_confirmer, confirmation_date,
                     biology_notes, general_observations, conservation_status)
                )
                id_observation = self.cursor.fetchone()['id_observation']
                self.conn.commit()
                
                print(f"✅ Importado: {row['CODIGO']} - {row.get('genero', '')} {row.get('especie', '')}")
                self.stats['imported'] += 1
                return True
            else:
                missing = []
                if not collection_date: missing.append('fecha')
                if not id_person: missing.append('recolector')
                if not id_preservation: missing.append('preservación')
                if not id_trap: missing.append('trampa')
                if not id_taxon: missing.append('taxonomía')
                if not id_geolocation: missing.append('geolocalización')
                msg = f"⚠️ Saltado {row['CODIGO']} - Faltan: {', '.join(missing)}"
                self.log(msg, 'WARNING', to_console=False)
                self.stats['skipped'] += 1
                self.stats['warnings'].append(msg)
                return False
                
        except Exception as e:
            error_msg = f"❌ Error en fila {row['CODIGO']}: {e}"
            self.log(error_msg, 'ERROR')
            self.stats['errors'].append(f"Fila {row['CODIGO']}: {str(e)}")
            self.conn.rollback()
            return False
    
    def import_csv(self, csv_path):
        """Importa todos los datos del archivo (CSV o Excel)"""
        print(f"\n📥 Iniciando importación desde: {csv_path}")
        print("=" * 60)
        
        # Leer archivo (CSV o Excel)
        if csv_path.endswith('.xlsx') or csv_path.endswith('.xls'):
            df = pd.read_excel(csv_path)
        else:
            df = pd.read_csv(csv_path)
        
        self.stats['total'] = len(df)
        
        print(f"📊 Total de registros a procesar: {self.stats['total']}")
        
        # Preparar niveles taxonómicos
        self.get_or_create_taxonomic_levels()
        
        # Procesar cada fila
        for index, row in df.iterrows():
            if index % 100 == 0:
                print(f"📈 Progreso: {index}/{self.stats['total']} registros procesados...")
            
            self.import_row(row)
        
        # Mostrar estadísticas finales
        self.print_summary()
        
        return self.stats['imported'] > 0
    
    def print_summary(self):
        """Imprime resumen de la importación"""
        # Escribir resumen en log
        self.log("="*60, 'INFO', to_console=False)
        self.log("RESUMEN DE IMPORTACIÓN:", 'INFO', to_console=False)
        self.log(f"Importados: {self.stats['imported']}", 'INFO', to_console=False)
        self.log(f"Saltados: {self.stats['skipped']}", 'INFO', to_console=False)
        self.log(f"Errores: {len(self.stats['errors'])}", 'INFO', to_console=False)
        self.log(f"Total procesados: {self.stats['total']}", 'INFO', to_console=False)
        
        # Escribir todos los errores en log
        if self.stats['errors']:
            self.log("\nERRORES ENCONTRADOS:", 'INFO', to_console=False)
            for error in self.stats['errors']:
                self.log(f"  - {error}", 'ERROR', to_console=False)
        
        # Imprimir resumen en consola
        print("\n" + "="*60)
        print("📊 RESUMEN DE IMPORTACIÓN:")
        print(f"  ✅ Importados: {self.stats['imported']}")
        print(f"  ⚠️ Saltados: {self.stats['skipped']}")
        print(f"  ❌ Errores: {len(self.stats['errors'])}")
        print(f"  📋 Total procesados: {self.stats['total']}")
        
        if self.stats['errors']:
            print("\n⚠️ ERRORES ENCONTRADOS:")
            for error in self.stats['errors'][:10]:  # Mostrar solo los primeros 10
                print(f"  - {error}")
            if len(self.stats['errors']) > 10:
                print(f"  ... y {len(self.stats['errors']) - 10} errores más")
        
        # Mostrar ubicación del log
        print(f"\n📝 Log completo guardado en: {self.log_file}")
        
        return self.stats['imported'] > 0

def main():
    """Función principal"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Importa datos de colecciones biológicas desde un archivo CSV/Excel"
    )
    parser.add_argument(
        "csv_path",
        help="Ruta al archivo .csv / .xlsx / .xls a importar",
    )

    args = parser.parse_args()

    csv_path = os.path.abspath(args.csv_path)

    if not os.path.exists(csv_path):
        print(f"❌ Archivo no encontrado: {csv_path}")
        print("💡 Verifica que la ruta sea correcta (puede ser relativa o absoluta)")
        return 1

    importer = DataImporter()

    if not importer.connect():
        return 1

    try:
        success = importer.import_csv(csv_path)

        if success:
            print("\n✅ ¡Importación completada exitosamente!")
            print("🎉 Los datos están listos para usar en la aplicación")
        else:
            print("\n⚠️ La importación finalizó con advertencias")

    except Exception as e:
        print(f"\n❌ Error crítico durante la importación: {e}")
        return 1
    finally:
        importer.disconnect()

    return 0

if __name__ == "__main__":
    sys.exit(main())
