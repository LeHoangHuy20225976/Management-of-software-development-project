"""
LangChain Tools for Database Queries
Define tools mà LLM có thể sử dụng để query database
"""
from langchain.tools import tool
from typing import Optional
from datetime import date, datetime
import json
from .db_tools import get_db_tools


@tool
async def get_user_info(user_id: int) -> str:
    """
    Lấy thông tin chi tiết của user theo ID.
    
    Args:
        user_id: ID của user cần tìm
        
    Returns:
        JSON string chứa thông tin user
    """
    db = get_db_tools()
    user = await db.get_user_by_id(user_id)
    
    if user:
        # Format date for display
        if user.get('date_of_birth'):
            user['date_of_birth'] = str(user['date_of_birth'])
        if user.get('created_at'):
            user['created_at'] = str(user['created_at'])
        return json.dumps(user, ensure_ascii=False, indent=2)
    return "Không tìm thấy user với ID này."


@tool
async def search_user_by_email(email: str) -> str:
    """
    Tìm user theo địa chỉ email.
    
    Args:
        email: Địa chỉ email của user
        
    Returns:
        JSON string chứa thông tin user
    """
    db = get_db_tools()
    user = await db.get_user_by_email(email)
    
    if user:
        if user.get('date_of_birth'):
            user['date_of_birth'] = str(user['date_of_birth'])
        if user.get('created_at'):
            user['created_at'] = str(user['created_at'])
        return json.dumps(user, ensure_ascii=False, indent=2)
    return f"Không tìm thấy user với email: {email}"


@tool
async def get_hotel_info(hotel_id: int) -> str:
    """
    Lấy thông tin chi tiết của khách sạn theo ID.
    
    Args:
        hotel_id: ID của khách sạn
        
    Returns:
        JSON string chứa thông tin khách sạn
    """
    db = get_db_tools()
    hotel = await db.get_hotel_by_id(hotel_id)
    
    if hotel:
        if hotel.get('created_at'):
            hotel['created_at'] = str(hotel['created_at'])
        return json.dumps(hotel, ensure_ascii=False, indent=2)
    return f"Không tìm thấy khách sạn với ID: {hotel_id}"


@tool
async def search_hotels(name: str = None, address: str = None, min_rating: float = None) -> str:
    """
    Tìm kiếm khách sạn theo tên, địa chỉ hoặc rating.
    
    Args:
        name: Tên khách sạn (có thể tìm từng phần)
        address: Địa chỉ hoặc khu vực
        min_rating: Rating tối thiểu (từ 0 đến 5)
        
    Returns:
        JSON string chứa danh sách khách sạn
    """
    db = get_db_tools()
    hotels = await db.search_hotels(name=name, address=address, min_rating=min_rating)
    
    if hotels:
        for hotel in hotels:
            if hotel.get('created_at'):
                hotel['created_at'] = str(hotel['created_at'])
        return json.dumps(hotels, ensure_ascii=False, indent=2)
    return "Không tìm thấy khách sạn nào phù hợp."


@tool
async def get_user_bookings(user_id: int, status: str = None) -> str:
    """
    Lấy danh sách đặt phòng của user.
    
    Args:
        user_id: ID của user
        status: Trạng thái đặt phòng (pending, confirmed, cancelled, completed)
        
    Returns:
        JSON string chứa danh sách bookings
    """
    db = get_db_tools()
    bookings = await db.get_user_bookings(user_id, status)
    
    if bookings:
        for booking in bookings:
            if booking.get('check_in_date'):
                booking['check_in_date'] = str(booking['check_in_date'])
            if booking.get('check_out_date'):
                booking['check_out_date'] = str(booking['check_out_date'])
            if booking.get('created_at'):
                booking['created_at'] = str(booking['created_at'])
        return json.dumps(bookings, ensure_ascii=False, indent=2)
    return f"User {user_id} không có booking nào."


@tool
async def get_booking_details(booking_id: int) -> str:
    """
    Lấy chi tiết đặt phòng theo ID.
    
    Args:
        booking_id: ID của booking
        
    Returns:
        JSON string chứa chi tiết booking
    """
    db = get_db_tools()
    booking = await db.get_booking_by_id(booking_id)
    
    if booking:
        if booking.get('check_in_date'):
            booking['check_in_date'] = str(booking['check_in_date'])
        if booking.get('check_out_date'):
            booking['check_out_date'] = str(booking['check_out_date'])
        if booking.get('created_at'):
            booking['created_at'] = str(booking['created_at'])
        return json.dumps(booking, ensure_ascii=False, indent=2)
    return f"Không tìm thấy booking với ID: {booking_id}"


@tool
async def search_available_rooms(
    hotel_id: int = None,
    check_in_date: str = None,
    check_out_date: str = None,
    min_price: int = None,
    max_price: int = None
) -> str:
    """
    Tìm kiếm phòng có sẵn (available) với các điều kiện.
    
    Args:
        hotel_id: ID của khách sạn
        check_in_date: Ngày check-in (format: YYYY-MM-DD)
        check_out_date: Ngày check-out (format: YYYY-MM-DD)
        min_price: Giá tối thiểu mỗi đêm (VND)
        max_price: Giá tối đa mỗi đêm (VND)
        
    Returns:
        JSON string chứa danh sách phòng available
    """
    db = get_db_tools()
    
    # Convert string dates to date objects
    check_in = None
    check_out = None
    if check_in_date:
        try:
            check_in = datetime.strptime(check_in_date, "%Y-%m-%d").date()
        except:
            pass
    if check_out_date:
        try:
            check_out = datetime.strptime(check_out_date, "%Y-%m-%d").date()
        except:
            pass
    
    rooms = await db.search_available_rooms(
        hotel_id=hotel_id,
        check_in_date=check_in,
        check_out_date=check_out,
        min_price=min_price,
        max_price=max_price
    )
    
    if rooms:
        return json.dumps(rooms, ensure_ascii=False, indent=2)
    return "Không tìm thấy phòng nào phù hợp với điều kiện tìm kiếm."


@tool
async def get_room_details(room_id: int) -> str:
    """
    Lấy chi tiết phòng theo ID.
    
    Args:
        room_id: ID của phòng
        
    Returns:
        JSON string chứa thông tin phòng
    """
    db = get_db_tools()
    room = await db.get_room_by_id(room_id)
    
    if room:
        if room.get('created_at'):
            room['created_at'] = str(room['created_at'])
        return json.dumps(room, ensure_ascii=False, indent=2)
    return f"Không tìm thấy phòng với ID: {room_id}"


@tool
async def get_hotel_statistics(hotel_id: int) -> str:
    """
    Lấy thống kê của khách sạn (số phòng, bookings, reviews, etc.).
    
    Args:
        hotel_id: ID của khách sạn
        
    Returns:
        JSON string chứa thống kê
    """
    db = get_db_tools()
    stats = await db.get_hotel_statistics(hotel_id)
    
    if stats:
        return json.dumps(stats, ensure_ascii=False, indent=2)
    return f"Không thể lấy thống kê cho khách sạn ID: {hotel_id}"


# List of all tools
ALL_TOOLS = [
    get_user_info,
    search_user_by_email,
    get_hotel_info,
    search_hotels,
    get_user_bookings,
    get_booking_details,
    search_available_rooms,
    get_room_details,
    get_hotel_statistics,
]
