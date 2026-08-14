#!/usr/bin/env python3
"""
Script para limpiar todas las tablas de la base de datos
Útil para pruebas y para empezar una importación desde cero
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import sys

# Configuración de base de datos
DB_CONFIG = {
    'host': 'localhost',
    'database': 'animal_register',
    'user': 'postgres',
    'password': 'postgres',
    'port': 5432
}

def clean_database(reset_sequences=True, keep_users=False):
    """
    Limpia todas las tablas de la base de datos
    
    Args:
        reset_sequences: Si es True, reinicia los IDs a 1
        keep_users: Si es True, mantiene los usuarios y roles (para no perder admin)
    """
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("✅ Conectado a PostgreSQL")
        
        # Orden de eliminación (inverso a la creación, respetando FK)
        tables_to_clean = [
            # Datos de observaciones y clima
            'ClimateData',
            'Observation',
            
            # Colecciones
            'Collection',
            
            # Geolocalización
            'Geolocation',
            
            # Taxonomía (de más específico a más general por parent_id)
            'Taxon',
            'Author',
            'TaxonomicLevel',
            
            # Ubicaciones (de más específico a más general)
            'Locality',
            'Department',
            'Province',
            'Country',
            
            # Entidades auxiliares
            'Person',
            'Trap',
            'PreservationMethod',
            'Environment',
            'Caste',
        ]
        
        # Si keep_users es False, también limpiar usuarios
        if not keep_users:
            tables_to_clean.extend(['User', 'Rol'])
        
        print("\n🗑️  Iniciando limpieza de la base de datos...")
        print("=" * 60)
        
        deleted_counts = {}
        
        # Contar registros antes de eliminar
        for table in tables_to_clean:
            try:
                cursor.execute(f'SELECT COUNT(*) as count FROM public."{table}"')
                count = cursor.fetchone()['count']
                deleted_counts[table] = count
            except Exception as e:
                print(f"⚠️  No se pudo contar {table}: {e}")
                deleted_counts[table] = 0
        
        # Eliminar registros de cada tabla
        for table in tables_to_clean:
            try:
                count = deleted_counts.get(table, 0)
                if count > 0:
                    # Usar TRUNCATE CASCADE para eliminar todo rápidamente
                    cursor.execute(f'TRUNCATE TABLE public."{table}" CASCADE')
                    print(f"✅ {table}: {count} registros eliminados")
                else:
                    print(f"⏭️  {table}: ya estaba vacía")
            except Exception as e:
                print(f"❌ Error limpiando {table}: {e}")
                conn.rollback()
                # Intentar con DELETE si TRUNCATE falla
                try:
                    cursor.execute(f'DELETE FROM public."{table}"')
                    print(f"✅ {table}: limpiada con DELETE")
                except Exception as e2:
                    print(f"❌ Error con DELETE en {table}: {e2}")
        
        conn.commit()
        
        # Reiniciar secuencias si se solicita
        if reset_sequences:
            print("\n🔄 Reiniciando secuencias de IDs...")
            
            sequences = [
                ('Observation', 'id_observation'),
                ('Collection', 'id_collection'),
                ('Geolocation', 'id_geolocation'),
                ('ClimateData', 'id_climate_data'),
                ('Taxon', 'id_taxon'),
                ('Author', 'id_author'),
                ('TaxonomicLevel', 'id_taxonomic_level'),
                ('Locality', 'id_locality'),
                ('Department', 'id_department'),
                ('Province', 'id_province'),
                ('Country', 'id_country'),
                ('Person', 'id_person'),
                ('Trap', 'id_trap'),
                ('PreservationMethod', 'id_preservation_method'),
                ('Environment', 'id_environment'),
                ('Caste', 'id_caste'),
            ]
            
            if not keep_users:
                sequences.extend([
                    ('User', 'user_id'),
                    ('Rol', 'role_id'),
                ])
            
            for table, id_column in sequences:
                try:
                    # Obtener el nombre de la secuencia
                    cursor.execute(f"""
                        SELECT pg_get_serial_sequence('public."{table}', '{id_column}') as seq_name
                    """)
                    result = cursor.fetchone()
                    if result and result['seq_name']:
                        seq_name = result['seq_name']
                        cursor.execute(f"ALTER SEQUENCE {seq_name} RESTART WITH 1")
                        print(f"  ✅ {table}.{id_column} reiniciado a 1")
                except Exception as e:
                    print(f"  ⚠️  No se pudo reiniciar secuencia de {table}: {e}")
            
            conn.commit()
        
        # Mostrar resumen
        print("\n" + "=" * 60)
        print("📊 RESUMEN DE LIMPIEZA:")
        total_deleted = sum(deleted_counts.values())
        print(f"  🗑️  Total de registros eliminados: {total_deleted}")
        
        if total_deleted > 0:
            print("\n  Detalle por tabla:")
            for table, count in deleted_counts.items():
                if count > 0:
                    print(f"    • {table}: {count}")
        
        if keep_users:
            print("\n  ℹ️  Usuarios y roles mantenidos (use --clean-all para eliminar)")
        
        print("=" * 60)
        print("\n✅ ¡Base de datos limpiada exitosamente!")
        print("🎉 Lista para una nueva importación")
        
        cursor.close()
        conn.close()
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error crítico: {e}")
        return 1

def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Limpia todas las tablas de la base de datos',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python3 scripts/clean_database.py                    # Limpia todo excepto usuarios
  python3 scripts/clean_database.py --clean-all        # Limpia TODO incluyendo usuarios
  python3 scripts/clean_database.py --no-reset-ids     # Limpia pero mantiene los IDs actuales
        """
    )
    
    parser.add_argument(
        '--clean-all',
        action='store_true',
        help='Eliminar también usuarios y roles (incluyendo admin)'
    )
    
    parser.add_argument(
        '--no-reset-ids',
        action='store_true',
        help='No reiniciar las secuencias de IDs a 1'
    )
    
    args = parser.parse_args()
    
    # Advertencia si se va a eliminar todo
    if args.clean_all:
        print("\n⚠️  ADVERTENCIA: Se eliminarán TODOS los datos incluyendo usuarios!")
        print("⚠️  Tendrás que volver a crear el usuario admin.")
        response = input("\n¿Estás seguro? Escribe 'SI' para continuar: ")
        if response != 'SI':
            print("❌ Operación cancelada")
            return 0
    else:
        print("\nℹ️  Se limpiarán todos los datos EXCEPTO usuarios y roles")
        print("ℹ️  El usuario admin se mantendrá")
        response = input("\n¿Continuar? (s/n): ")
        if response.lower() not in ['s', 'si', 'y', 'yes']:
            print("❌ Operación cancelada")
            return 0
    
    return clean_database(
        reset_sequences=not args.no_reset_ids,
        keep_users=not args.clean_all
    )

if __name__ == "__main__":
    sys.exit(main())
