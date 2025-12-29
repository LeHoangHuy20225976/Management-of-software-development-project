"""
Add real image URLs from Unsplash to database
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.infrastructure.config import get_settings
import psycopg2

settings = get_settings()

def get_db_connection():
    """Get PostgreSQL connection"""
    host = 'localhost' if settings.postgres_host == 'postgres' else settings.postgres_host
    port = 5433 if settings.postgres_host == 'postgres' else settings.postgres_port

    return psycopg2.connect(
        host=host,
        port=port,
        dbname=settings.postgres_db,
        user=settings.postgres_user,
        password=settings.postgres_password
    )

# Real Unsplash image URLs (high quality, free to use)
real_images = [
    {
        'old_url': '/ho_guom_sunset.jpg',
        'new_url': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',  # Hoan Kiem Lake sunset
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/bana_bridge.jpg',
        'new_url': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',  # Golden Bridge Vietnam
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/hanoi_grand_lobby.jpg',
        'new_url': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',  # Luxury hotel lobby
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/danang_ocean_pool.jpg',
        'new_url': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',  # Infinity pool ocean view
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/room_101_interior.jpg',
        'new_url': 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',  # Modern hotel room
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/suite_501_living.jpg',
        'new_url': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',  # Luxury suite living room
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/hanoi_grand_pool.jpg',
        'new_url': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80',  # Rooftop pool city view
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/hanoi_grand_restaurant.jpg',
        'new_url': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',  # Fine dining restaurant
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/danang_beach.jpg',
        'new_url': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',  # Beach white sand
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/danang_deluxe_room.jpg',
        'new_url': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',  # Deluxe ocean view room
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/saigon_luxury_suite.jpg',
        'new_url': 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80',  # Presidential suite
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/saigon_spa.jpg',
        'new_url': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',  # Spa wellness center
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/mountain_resort_view.jpg',
        'new_url': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',  # Mountain valley resort
        'width': 800,
        'height': 600,
        'format': 'jpg'
    },
    {
        'old_url': '/beach_resort_pool.jpg',
        'new_url': 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',  # Tropical resort pool
        'width': 800,
        'height': 600,
        'format': 'jpg'
    }
]

def update_image_urls():
    """Update image URLs to real Unsplash photos"""
    conn = get_db_connection()
    cur = conn.cursor()

    updated = 0
    for img in real_images:
        cur.execute("""
            UPDATE Image
            SET
                image_url = %s,
                image_width = %s,
                image_height = %s,
                image_format = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE image_url = %s
        """, (img['new_url'], img['width'], img['height'], img['format'], img['old_url']))

        if cur.rowcount > 0:
            updated += cur.rowcount
            print(f"✅ Updated {img['old_url']} -> {img['new_url']}")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n🎉 Updated {updated} images with real Unsplash URLs!")

if __name__ == '__main__':
    print("🖼️  Updating images with real Unsplash photos...")
    update_image_urls()
