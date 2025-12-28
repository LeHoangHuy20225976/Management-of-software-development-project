"""
LangChain Tools for Database Queries (Synchronous version)
Define tools mà LLM có thể sử dụng để query database
"""
from langchain.tools import tool
from typing import Optional
from . import db_tools_sync as db


@tool
def get_user_info(user_id: int) -> str:
    """
    Lấy thông tin chi tiết của user theo ID.
    
    Args:
        user_id: ID của user cần tìm
        
    Returns:
        JSON string chứa thông tin user
    """
    return db.get_user_by_id(user_id)


@tool
def search_user_by_email(email: str) -> str:
    """
    Tìm user theo địa chỉ email.
    
    Args:
        email: Địa chỉ email của user
        
    Returns:
        JSON string chứa thông tin user
    """
    return db.get_user_by_email(email)


@tool
def get_hotel_info(hotel_id: int) -> str:
    """
    Lấy thông tin chi tiết của khách sạn theo ID.
    
    Args:
        hotel_id: ID của khách sạn
        
    Returns:
        JSON string chứa thông tin khách sạn
    """
    return db.get_hotel_by_id(hotel_id)


@tool
def search_hotels(name: str = None, address: str = None, min_rating: float = None) -> str:
    """
    Tìm kiếm khách sạn theo tên, địa chỉ hoặc rating.
    
    Args:
        name: Tên khách sạn (có thể tìm từng phần)
        address: Địa chỉ hoặc khu vực
        min_rating: Rating tối thiểu (từ 0 đến 5)
        
    Returns:
        JSON string chứa danh sách khách sạn
    """
    return db.search_hotels(name=name, address=address, min_rating=min_rating)


@tool
def get_user_bookings(user_id: int, status: str = None) -> str:
    """
    Lấy danh sách đặt phòng của user.
    
    Args:
        user_id: ID của user
        status: Trạng thái đặt phòng (pending, accepted, rejected, cancelled)
        
    Returns:
        JSON string chứa danh sách bookings
    """
    return db.get_user_bookings(user_id, status)


@tool
def get_booking_details(booking_id: int) -> str:
    """
    Lấy chi tiết đặt phòng theo ID.
    
    Args:
        booking_id: ID của booking
        
    Returns:
        JSON string chứa chi tiết booking
    """
    return db.get_booking_by_id(booking_id)


@tool
def search_available_rooms(
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
    return db.search_available_rooms(
        hotel_id=hotel_id,
        check_in_date=check_in_date,
        check_out_date=check_out_date,
        min_price=min_price,
        max_price=max_price
    )


@tool
def get_room_details(room_id: int) -> str:
    """
    Lấy chi tiết phòng theo ID.
    
    Args:
        room_id: ID của phòng
        
    Returns:
        JSON string chứa thông tin phòng
    """
    return db.get_room_by_id(room_id)


@tool
def get_hotel_statistics(hotel_id: int) -> str:
    """
    Lấy thống kê của khách sạn (số phòng, bookings, reviews, etc.).
    
    Args:
        hotel_id: ID của khách sạn
        
    Returns:
        JSON string chứa thống kê
    """
    return db.get_hotel_statistics(hotel_id)


@tool
def get_all_destinations() -> str:
    """
    Lấy danh sách tất cả các điểm đến có trong hệ thống.
    
    Returns:
        JSON string chứa danh sách destinations
    """
    return db.get_destinations()


@tool
def get_hotels_in_destination(destination_id: int) -> str:
    """
    Lấy danh sách khách sạn theo điểm đến.
    
    Args:
        destination_id: ID của destination/điểm đến
        
    Returns:
        JSON string chứa danh sách khách sạn
    """
    return db.get_hotels_by_destination(destination_id)


# Export all tools
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
    get_all_destinations,
    get_hotels_in_destination,
]


def get_all_tools():
    """Return all available tools"""
    return ALL_TOOLS
