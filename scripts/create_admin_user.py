#!/usr/bin/env python3
"""
Script para crear un usuario administrador inicial
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt

# Configuración de base de datos
DB_CONFIG = {
    'host': 'localhost',
    'database': 'animal_register',
    'user': 'postgres',
    'password': 'postgres',
    'port': 5432
}

def hash_password(password: str) -> str:
    """Hash de password con bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_admin_user():
    """Crea usuario admin y roles necesarios"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        print("✅ Conectado a PostgreSQL")
        
        # 1. Crear roles si no existen
        roles = ['ADMIN', 'USER', 'RESEARCHER']
        
        for role_name in roles:
            cursor.execute(
                'SELECT role_id FROM public."Rol" WHERE name = %s',
                (role_name,)
            )
            result = cursor.fetchone()
            
            if not result:
                cursor.execute(
                    'INSERT INTO public."Rol" (name) VALUES (%s) RETURNING role_id',
                    (role_name,)
                )
                print(f"✅ Rol creado: {role_name}")
            else:
                print(f"ℹ️  Rol ya existe: {role_name}")
        
        conn.commit()
        
        # 2. Obtener ID del rol ADMIN
        cursor.execute('SELECT role_id FROM public."Rol" WHERE name = %s', ('ADMIN',))
        admin_rol = cursor.fetchone()
        admin_role_id = admin_rol['role_id']
        
        # 3. Crear usuario admin si no existe
        cursor.execute(
            'SELECT user_id FROM public."User" WHERE email = %s',
            ('admin@gema.com',)
        )
        existing_user = cursor.fetchone()
        
        if existing_user:
            print("⚠️  Usuario admin@gema.com ya existe")
            cursor.close()
            conn.close()
            return
        
        # Hashear password
        hashed_password = hash_password('admin123')
        
        # Insertar usuario con first_name y last_name
        cursor.execute(
            '''INSERT INTO public."User" (first_name, last_name, email, password, role_id)
               VALUES (%s, %s, %s, %s, %s) RETURNING user_id''',
            ('Admin', 'GEMA', 'admin@gema.com', hashed_password, admin_role_id)
        )
        user_id = cursor.fetchone()['user_id']
        conn.commit()
        
        print("\n" + "="*60)
        print("✅ ¡Usuario administrador creado exitosamente!")
        print("="*60)
        print(f"👤 Nombre: Admin GEMA")
        print(f"📧 Email: admin@gema.com")
        print(f"🔑 Password: admin123")
        print(f"🆔 ID: {user_id}")
        print(f"🛡️  Rol: ADMIN")
        print("="*60)
        print("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(create_admin_user())
