"""
Database Query Tools for LLM
Các function để AI query database và lấy thông tin thực tế
"""
import asyncpg
from typing import Dict, List, Optional
from datetime import datetime, date
import json


class DatabaseTools:
    """Tools để query database cho LLM"""
    
    def __init__(self, connection_string: str):
        """
        Initialize database connection
        
        Args:
            connection_string: PostgreSQL connection string
        """
        self.connection_string = connection_string
        self.pool = None
    
    async def init_pool(self):
        """Initialize connection pool"""
        if not self.pool:
            self.pool = await asyncpg.create_pool(self.connection_string)
    
    async def close(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
    
    # ========================================================================
    # USER QUERIES
    # ========================================================================
    
    async def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """
        Lấy thông tin user theo ID
        
        Args:
            user_id: ID của user
            
        Returns:
            Dict chứa thông tin user hoặc None
        """
        await self.init_pool()
        
        query = """
        SELECT user_id, name, email, phone_number, gender, 
               date_of_birth, role, profile_image, created_at
        FROM "User"
        WHERE user_id = $1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, user_id)
            if row:
                return dict(row)
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        """
        Lấy thông tin user theo email
        
        Args:
            email: Email của user
            
        Returns:
            Dict chứa thông tin user hoặc None
        """
        await self.init_pool()
        
        query = """
        SELECT user_id, name, email, phone_number, gender, 
               date_of_birth, role, profile_image, created_at
        FROM "User"
        WHERE email = $1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, email)
            if row:
                return dict(row)
            return None
    
    async def search_users(self, name: str = None, role: str = None) -> List[Dict]:
        """
        Tìm kiếm users theo tên hoặc role
        
        Args:
            name: Tên user (có thể là partial match)
            role: Role của user (customer, hotel_owner, admin)
            
        Returns:
            List of user dicts
        """
        await self.init_pool()
        
        conditions = []
        params = []
        param_count = 0
        
        if name:
            param_count += 1
            conditions.append(f"name ILIKE ${param_count}")
            params.append(f"%{name}%")
        
        if role:
            param_count += 1
            conditions.append(f"role = ${param_count}")
            params.append(role)
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        query = f"""
        SELECT user_id, name, email, phone_number, gender, 
               date_of_birth, role, created_at
        FROM "User"
        WHERE {where_clause}
        LIMIT 20
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
    
    # ========================================================================
    # HOTEL QUERIES
    # ========================================================================
    
    async def get_hotel_by_id(self, hotel_id: int) -> Optional[Dict]:
        """
        Lấy thông tin hotel theo ID
        
        Args:
            hotel_id: ID của hotel
            
        Returns:
            Dict chứa thông tin hotel hoặc None
        """
        await self.init_pool()
        
        query = """
        SELECT h.hotel_id, h.name, h.address, h.status, h.rating,
               h.longitude, h.latitude, h.description, h.contact_phone,
               h.thumbnail, h.created_at,
               u.name as owner_name, u.email as owner_email
        FROM "Hotel" h
        LEFT JOIN "User" u ON h.hotel_owner = u.user_id
        WHERE h.hotel_id = $1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, hotel_id)
            if row:
                return dict(row)
            return None
    
    async def search_hotels(
        self, 
        name: str = None, 
        address: str = None,
        min_rating: float = None
    ) -> List[Dict]:
        """
        Tìm kiếm hotels
        
        Args:
            name: Tên hotel (partial match)
            address: Địa chỉ (partial match)
            min_rating: Rating tối thiểu
            
        Returns:
            List of hotel dicts
        """
        await self.init_pool()
        
        conditions = ["status = 1"]  # Only active hotels
        params = []
        param_count = 0
        
        if name:
            param_count += 1
            conditions.append(f"name ILIKE ${param_count}")
            params.append(f"%{name}%")
        
        if address:
            param_count += 1
            conditions.append(f"address ILIKE ${param_count}")
            params.append(f"%{address}%")
        
        if min_rating is not None:
            param_count += 1
            conditions.append(f"rating >= ${param_count}")
            params.append(min_rating)
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
        SELECT hotel_id, name, address, rating, description,
               contact_phone, thumbnail, created_at
        FROM "Hotel"
        WHERE {where_clause}
        ORDER BY rating DESC
        LIMIT 20
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
    
    # ========================================================================
    # BOOKING QUERIES
    # ========================================================================
    
    async def get_user_bookings(
        self,
        user_id: int,
        status: str = None
    ) -> List[Dict]:
        """
        Lấy danh sách bookings của user
        
        Args:
            user_id: ID của user
            status: Status của booking (pending, confirmed, cancelled, completed)
            
        Returns:
            List of booking dicts
        """
        await self.init_pool()
        
        conditions = ["b.user_id = $1"]
        params = [user_id]
        
        if status:
            conditions.append("b.status = $2")
            params.append(status)
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
        SELECT b.booking_id, b.status, b.total_price,
               b.check_in_date, b.check_out_date, b.people, b.created_at,
               r.name as room_name, r.location as room_location,
               rt.name as room_type_name,
               h.name as hotel_name, h.address as hotel_address
        FROM "Booking" b
        JOIN "Room" r ON b.room_id = r.room_id
        JOIN "RoomType" rt ON r.type_id = rt.type_id
        JOIN "Hotel" h ON rt.hotel_id = h.hotel_id
        WHERE {where_clause}
        ORDER BY b.created_at DESC
        LIMIT 50
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
    
    async def get_booking_by_id(self, booking_id: int) -> Optional[Dict]:
        """
        Lấy chi tiết booking theo ID
        
        Args:
            booking_id: ID của booking
            
        Returns:
            Dict chứa thông tin booking hoặc None
        """
        await self.init_pool()
        
        query = """
        SELECT b.booking_id, b.user_id, b.room_id, b.status,
               b.total_price, b.check_in_date, b.check_out_date,
               b.people, b.created_at,
               u.name as user_name, u.email as user_email,
               u.phone_number as user_phone,
               r.name as room_name, r.location as room_location,
               rt.name as room_type_name, rt.price_per_night,
               h.name as hotel_name, h.address as hotel_address,
               h.contact_phone as hotel_phone
        FROM "Booking" b
        JOIN "User" u ON b.user_id = u.user_id
        JOIN "Room" r ON b.room_id = r.room_id
        JOIN "RoomType" rt ON r.type_id = rt.type_id
        JOIN "Hotel" h ON rt.hotel_id = h.hotel_id
        WHERE b.booking_id = $1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, booking_id)
            if row:
                return dict(row)
            return None
    
    # ========================================================================
    # ROOM QUERIES
    # ========================================================================
    
    async def search_available_rooms(
        self,
        hotel_id: int = None,
        check_in_date: date = None,
        check_out_date: date = None,
        min_price: int = None,
        max_price: int = None
    ) -> List[Dict]:
        """
        Tìm kiếm phòng available
        
        Args:
            hotel_id: ID của hotel
            check_in_date: Ngày check-in
            check_out_date: Ngày check-out
            min_price: Giá tối thiểu
            max_price: Giá tối đa
            
        Returns:
            List of available room dicts
        """
        await self.init_pool()
        
        conditions = ["r.status = 1"]  # Only available rooms
        params = []
        param_count = 0
        
        if hotel_id:
            param_count += 1
            conditions.append(f"rt.hotel_id = ${param_count}")
            params.append(hotel_id)
        
        if min_price is not None:
            param_count += 1
            conditions.append(f"rt.price_per_night >= ${param_count}")
            params.append(min_price)
        
        if max_price is not None:
            param_count += 1
            conditions.append(f"rt.price_per_night <= ${param_count}")
            params.append(max_price)
        
        # Check if room is not booked during the requested period
        if check_in_date and check_out_date:
            param_count += 2
            conditions.append(f"""
                NOT EXISTS (
                    SELECT 1 FROM "Booking" b
                    WHERE b.room_id = r.room_id
                    AND b.status IN ('confirmed', 'pending')
                    AND (
                        (b.check_in_date <= ${param_count-1} AND b.check_out_date > ${param_count-1})
                        OR (b.check_in_date < ${param_count} AND b.check_out_date >= ${param_count})
                        OR (b.check_in_date >= ${param_count-1} AND b.check_out_date <= ${param_count})
                    )
                )
            """)
            params.extend([check_in_date, check_out_date])
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
        SELECT r.room_id, r.name as room_name, r.location, r.status,
               r.number_of_single_beds, r.number_of_double_beds,
               r.room_view, r.room_size, r.notes,
               rt.name as room_type_name, rt.price_per_night,
               rt.max_people, rt.description as room_type_description,
               h.name as hotel_name, h.address as hotel_address,
               h.rating as hotel_rating
        FROM "Room" r
        JOIN "RoomType" rt ON r.type_id = rt.type_id
        JOIN "Hotel" h ON rt.hotel_id = h.hotel_id
        WHERE {where_clause}
        ORDER BY rt.price_per_night ASC
        LIMIT 50
        """
        
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
    
    async def get_room_by_id(self, room_id: int) -> Optional[Dict]:
        """
        Lấy chi tiết phòng theo ID
        
        Args:
            room_id: ID của room
            
        Returns:
            Dict chứa thông tin room hoặc None
        """
        await self.init_pool()
        
        query = """
        SELECT r.room_id, r.name as room_name, r.location, r.status,
               r.number_of_single_beds, r.number_of_double_beds,
               r.room_view, r.room_size, r.notes, r.created_at,
               rt.name as room_type_name, rt.price_per_night,
               rt.max_people, rt.description as room_type_description,
               h.hotel_id, h.name as hotel_name, h.address as hotel_address,
               h.rating as hotel_rating, h.contact_phone as hotel_phone
        FROM "Room" r
        JOIN "RoomType" rt ON r.type_id = rt.type_id
        JOIN "Hotel" h ON rt.hotel_id = h.hotel_id
        WHERE r.room_id = $1
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, room_id)
            if row:
                return dict(row)
            return None
    
    # ========================================================================
    # STATISTICS QUERIES
    # ========================================================================
    
    async def get_hotel_statistics(self, hotel_id: int) -> Dict:
        """
        Lấy thống kê của hotel
        
        Args:
            hotel_id: ID của hotel
            
        Returns:
            Dict chứa thống kê
        """
        await self.init_pool()
        
        query = """
        SELECT 
            COUNT(DISTINCT rt.type_id) as total_room_types,
            COUNT(DISTINCT r.room_id) as total_rooms,
            COUNT(DISTINCT CASE WHEN r.status = 1 THEN r.room_id END) as available_rooms,
            COUNT(DISTINCT b.booking_id) as total_bookings,
            COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.booking_id END) as confirmed_bookings,
            COALESCE(AVG(rev.rating), 0) as average_review_rating,
            COUNT(DISTINCT rev.review_id) as total_reviews
        FROM "Hotel" h
        LEFT JOIN "RoomType" rt ON h.hotel_id = rt.hotel_id
        LEFT JOIN "Room" r ON rt.type_id = r.type_id
        LEFT JOIN "Booking" b ON r.room_id = b.room_id
        LEFT JOIN "Review" rev ON h.hotel_id = rev.hotel_id
        WHERE h.hotel_id = $1
        GROUP BY h.hotel_id
        """
        
        async with self.pool.acquire() as conn:
            row = await conn.fetchrow(query, hotel_id)
            if row:
                return dict(row)
            return {}


# Singleton instance
_db_tools = None

def get_db_tools() -> DatabaseTools:
    """Get database tools instance"""
    global _db_tools
    if _db_tools is None:
        from src.infrastructure.config import get_settings
        settings = get_settings()
        _db_tools = DatabaseTools(settings.postgres_chat_url)
    return _db_tools
