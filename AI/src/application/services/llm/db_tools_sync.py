"""
Database Query Tools for LLM (Synchronous version)
Các function để AI query database và lấy thông tin thực tế
Dùng psycopg2 thay vì asyncpg để tránh event loop issues với LangChain
"""
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, List, Optional
from datetime import datetime, date
import json
import os


def get_connection():
    """Get a new database connection"""
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'postgres'),
        port=int(os.getenv('POSTGRES_PORT', 5432)),
        user=os.getenv('POSTGRES_USER', 'hotel_user'),
        password=os.getenv('POSTGRES_PASSWORD', 'hotel_password'),
        database=os.getenv('POSTGRES_DB', 'hotel_db')
    )


class DateTimeEncoder(json.JSONEncoder):
    """Custom JSON encoder for datetime objects"""
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)


def to_json(data) -> str:
    """Convert data to JSON string with datetime support"""
    return json.dumps(data, cls=DateTimeEncoder, ensure_ascii=False, indent=2)


# ========================================================================
# USER QUERIES
# ========================================================================

def get_user_by_id(user_id: int) -> str:
    """
    Lấy thông tin user theo ID
    
    Args:
        user_id: ID của user
        
    Returns:
        JSON string chứa thông tin user
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT user_id, name, email, phone_number, gender, 
                       date_of_birth, role, profile_image
                FROM "User"
                WHERE user_id = %s
            """, (user_id,))
            row = cur.fetchone()
        conn.close()
        
        if row:
            return to_json({"success": True, "data": dict(row)})
        return to_json({"success": False, "error": f"User với ID {user_id} không tồn tại"})
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


def get_user_by_email(email: str) -> str:
    """
    Lấy thông tin user theo email
    
    Args:
        email: Email của user
        
    Returns:
        JSON string chứa thông tin user
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT user_id, name, email, phone_number, gender, 
                       date_of_birth, role, profile_image
                FROM "User"
                WHERE email = %s
            """, (email,))
            row = cur.fetchone()
        conn.close()
        
        if row:
            return to_json({"success": True, "data": dict(row)})
        return to_json({"success": False, "error": f"User với email {email} không tồn tại"})
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


# ========================================================================
# HOTEL QUERIES
# ========================================================================

def get_hotel_by_id(hotel_id: int) -> str:
    """
    Lấy thông tin khách sạn theo ID
    
    Args:
        hotel_id: ID của khách sạn
        
    Returns:
        JSON string chứa thông tin khách sạn
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT h.hotel_id, h.name, h.address, h.rating, h.description,
                       h.status, h.contact_phone, h.thumbnail,
                       u.name as owner_name
                FROM hotel h
                LEFT JOIN "User" u ON h.hotel_owner = u.user_id
                WHERE h.hotel_id = %s
            """, (hotel_id,))
            row = cur.fetchone()
        conn.close()
        
        if row:
            return to_json({"success": True, "data": dict(row)})
        return to_json({"success": False, "error": f"Khách sạn với ID {hotel_id} không tồn tại"})
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


def search_hotels(name: str = None, address: str = None, min_rating: float = None) -> str:
    """
    Tìm kiếm khách sạn theo tên, địa chỉ hoặc rating
    
    Args:
        name: Tên khách sạn (tìm kiếm từng phần)
        address: Địa chỉ hoặc khu vực
        min_rating: Rating tối thiểu
        
    Returns:
        JSON string chứa danh sách khách sạn
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            conditions = []
            params = []
            
            if name:
                conditions.append("h.name ILIKE %s")
                params.append(f"%{name}%")
            if address:
                conditions.append("h.address ILIKE %s")
                params.append(f"%{address}%")
            if min_rating is not None:
                conditions.append("h.rating >= %s")
                params.append(min_rating)
            
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            cur.execute(f"""
                SELECT h.hotel_id, h.name, h.address, h.rating, h.description,
                       h.status, h.contact_phone
                FROM hotel h
                WHERE {where_clause}
                ORDER BY h.rating DESC
                LIMIT 20
            """, params)
            rows = cur.fetchall()
        conn.close()
        
        return to_json({
            "success": True, 
            "count": len(rows),
            "data": [dict(row) for row in rows]
        })
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


# ========================================================================
# BOOKING QUERIES
# ========================================================================

def get_user_bookings(user_id: int, status: str = None) -> str:
    """
    Lấy danh sách booking của user
    
    Args:
        user_id: ID của user
        status: Trạng thái booking (pending, accepted, rejected, cancelled)
        
    Returns:
        JSON string chứa danh sách bookings
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if status:
                cur.execute("""
                    SELECT b.booking_id, b.user_id, b.room_id, b.status, 
                           b.total_price, b.check_in_date, b.check_out_date,
                           b.created_at, b.people,
                           r.name as room_name, h.name as hotel_name
                    FROM booking b
                    LEFT JOIN room r ON b.room_id = r.room_id
                    LEFT JOIN roomtype rt ON r.type_id = rt.type_id
                    LEFT JOIN hotel h ON rt.hotel_id = h.hotel_id
                    WHERE b.user_id = %s AND b.status = %s
                    ORDER BY b.created_at DESC
                """, (user_id, status))
            else:
                cur.execute("""
                    SELECT b.booking_id, b.user_id, b.room_id, b.status, 
                           b.total_price, b.check_in_date, b.check_out_date,
                           b.created_at, b.people,
                           r.name as room_name, h.name as hotel_name
                    FROM booking b
                    LEFT JOIN room r ON b.room_id = r.room_id
                    LEFT JOIN roomtype rt ON r.type_id = rt.type_id
                    LEFT JOIN hotel h ON rt.hotel_id = h.hotel_id
                    WHERE b.user_id = %s
                    ORDER BY b.created_at DESC
                """, (user_id,))
            rows = cur.fetchall()
        conn.close()
        
        return to_json({
            "success": True,
            "count": len(rows),
            "data": [dict(row) for row in rows]
        })
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


def get_booking_by_id(booking_id: int) -> str:
    """
    Lấy chi tiết booking theo ID
    
    Args:
        booking_id: ID của booking
        
    Returns:
        JSON string chứa chi tiết booking
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT b.booking_id, b.user_id, b.room_id, b.status, 
                       b.total_price, b.check_in_date, b.check_out_date,
                       b.created_at, b.people,
                       r.name as room_name, r.notes as room_description,
                       h.name as hotel_name, h.address as hotel_address,
                       u.name as user_name, u.email as user_email, u.phone_number
                FROM booking b
                LEFT JOIN room r ON b.room_id = r.room_id
                LEFT JOIN roomtype rt ON r.type_id = rt.type_id
                LEFT JOIN hotel h ON rt.hotel_id = h.hotel_id
                LEFT JOIN "User" u ON b.user_id = u.user_id
                WHERE b.booking_id = %s
            """, (booking_id,))
            row = cur.fetchone()
        conn.close()
        
        if row:
            return to_json({"success": True, "data": dict(row)})
        return to_json({"success": False, "error": f"Booking với ID {booking_id} không tồn tại"})
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


# ========================================================================
# ROOM QUERIES
# ========================================================================

def search_available_rooms(
    hotel_id: int = None,
    check_in_date: str = None,
    check_out_date: str = None,
    min_price: int = None,
    max_price: int = None
) -> str:
    """
    Tìm kiếm phòng có sẵn
    
    Args:
        hotel_id: ID của khách sạn
        check_in_date: Ngày check-in (YYYY-MM-DD)
        check_out_date: Ngày check-out (YYYY-MM-DD)
        min_price: Giá tối thiểu
        max_price: Giá tối đa
        
    Returns:
        JSON string chứa danh sách phòng
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            conditions = ["r.status = 'available'"]
            params = []
            
            if hotel_id:
                conditions.append("rt.hotel_id = %s")
                params.append(hotel_id)
            
            if min_price is not None:
                conditions.append("rp.price >= %s")
                params.append(min_price)
            
            if max_price is not None:
                conditions.append("rp.price <= %s")
                params.append(max_price)
            
            # Check for conflicting bookings
            if check_in_date and check_out_date:
                conditions.append("""
                    NOT EXISTS (
                        SELECT 1 FROM booking b 
                        WHERE b.room_id = r.room_id 
                        AND b.status IN ('pending', 'accepted')
                        AND b.check_in_date < %s 
                        AND b.check_out_date > %s
                    )
                """)
                params.extend([check_out_date, check_in_date])
            
            where_clause = " AND ".join(conditions)
            
            cur.execute(f"""
                SELECT r.room_id, r.name as room_name, r.notes as description, r.status,
                       rt.hotel_id, h.name as hotel_name,
                       rp.price as price_per_night,
                       rt.type as room_type_name, rt.max_guests as capacity
                FROM room r
                LEFT JOIN roomtype rt ON r.type_id = rt.type_id
                LEFT JOIN hotel h ON rt.hotel_id = h.hotel_id
                LEFT JOIN roomprice rp ON r.room_id = rp.room_id
                WHERE {where_clause}
                ORDER BY rp.price ASC
                LIMIT 20
            """, params)
            rows = cur.fetchall()
        conn.close()
        
        return to_json({
            "success": True,
            "count": len(rows),
            "data": [dict(row) for row in rows]
        })
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


def get_room_by_id(room_id: int) -> str:
    """
    Lấy chi tiết phòng theo ID
    
    Args:
        room_id: ID của phòng
        
    Returns:
        JSON string chứa thông tin phòng
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT r.room_id, r.name as room_name, r.notes as description, r.status,
                       rt.hotel_id, h.name as hotel_name, h.address as hotel_address,
                       rp.price as price_per_night,
                       rt.type as room_type_name, rt.max_guests as capacity
                FROM room r
                LEFT JOIN roomtype rt ON r.type_id = rt.type_id
                LEFT JOIN hotel h ON rt.hotel_id = h.hotel_id
                LEFT JOIN roomprice rp ON r.room_id = rp.room_id
                WHERE r.room_id = %s
            """, (room_id,))
            row = cur.fetchone()
        conn.close()
        
        if row:
            return to_json({"success": True, "data": dict(row)})
        return to_json({"success": False, "error": f"Phòng với ID {room_id} không tồn tại"})
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


# ========================================================================
# STATISTICS QUERIES  
# ========================================================================

def get_hotel_statistics(hotel_id: int) -> str:
    """
    Lấy thống kê của khách sạn
    
    Args:
        hotel_id: ID của khách sạn
        
    Returns:
        JSON string chứa thống kê
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get hotel info
            cur.execute("""
                SELECT hotel_id, name, address, rating
                FROM hotel
                WHERE hotel_id = %s
            """, (hotel_id,))
            hotel = cur.fetchone()
            
            if not hotel:
                conn.close()
                return to_json({"success": False, "error": f"Khách sạn với ID {hotel_id} không tồn tại"})
            
            # Count rooms
            cur.execute("""
                SELECT COUNT(*) as total_rooms,
                       SUM(CASE WHEN r.status = 'available' THEN 1 ELSE 0 END) as available_rooms
                FROM room r
                JOIN roomtype rt ON r.type_id = rt.type_id
                WHERE rt.hotel_id = %s
            """, (hotel_id,))
            room_stats = cur.fetchone()
            
            # Count bookings
            cur.execute("""
                SELECT COUNT(*) as total_bookings,
                       SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                       SUM(CASE WHEN b.status = 'accepted' THEN 1 ELSE 0 END) as accepted_bookings,
                       SUM(b.total_price) as total_revenue
                FROM booking b
                JOIN room r ON b.room_id = r.room_id
                JOIN roomtype rt ON r.type_id = rt.type_id
                WHERE rt.hotel_id = %s
            """, (hotel_id,))
            booking_stats = cur.fetchone()
            
            # Count reviews
            cur.execute("""
                SELECT COUNT(*) as total_reviews,
                       AVG(rating) as avg_rating
                FROM review
                WHERE hotel_id = %s
            """, (hotel_id,))
            review_stats = cur.fetchone()
            
        conn.close()
        
        return to_json({
            "success": True,
            "data": {
                "hotel": dict(hotel),
                "rooms": {
                    "total": room_stats['total_rooms'] if room_stats else 0,
                    "available": room_stats['available_rooms'] if room_stats else 0
                },
                "bookings": {
                    "total": booking_stats['total_bookings'] if booking_stats else 0,
                    "pending": booking_stats['pending_bookings'] if booking_stats else 0,
                    "accepted": booking_stats['accepted_bookings'] if booking_stats else 0,
                    "total_revenue": float(booking_stats['total_revenue']) if booking_stats and booking_stats['total_revenue'] else 0
                },
                "reviews": {
                    "total": review_stats['total_reviews'] if review_stats else 0,
                    "average_rating": float(review_stats['avg_rating']) if review_stats and review_stats['avg_rating'] else 0
                }
            }
        })
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


# ========================================================================
# DESTINATION QUERIES
# ========================================================================

def get_destinations() -> str:
    """
    Lấy danh sách tất cả các điểm đến
    
    Returns:
        JSON string chứa danh sách destinations
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT d.destination_id, d.name, d.description,
                       d.location, d.rating, d.type
                FROM destination d
                ORDER BY d.rating DESC NULLS LAST
            """)
            rows = cur.fetchall()
        conn.close()
        
        return to_json({
            "success": True,
            "count": len(rows),
            "data": [dict(row) for row in rows]
        })
    except Exception as e:
        return to_json({"success": False, "error": str(e)})


def get_hotels_by_destination(destination_id: int) -> str:
    """
    Lấy danh sách khách sạn theo điểm đến
    
    Args:
        destination_id: ID của destination
        
    Returns:
        JSON string chứa danh sách khách sạn
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Note: Hotel table doesn't have destination_id, returning hotels filtered by address similarity
            cur.execute("""
                SELECT h.hotel_id, h.name, h.address, h.rating, h.description,
                       h.status, h.contact_phone
                FROM hotel h
                ORDER BY h.rating DESC NULLS LAST
                LIMIT 20
            """)
            rows = cur.fetchall()
        conn.close()
        
        return to_json({
            "success": True,
            "count": len(rows),
            "data": [dict(row) for row in rows],
            "note": f"Showing all hotels (destination_id {destination_id} filter not applicable in current schema)"
        })
    except Exception as e:
        return to_json({"success": False, "error": str(e)})
