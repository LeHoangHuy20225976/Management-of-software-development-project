/**
 * Mock Images Data
 * Replace these URLs with actual image paths or API endpoints when ready
 */

export const mockImages = {
  // Hotel Images - replace with actual uploaded images
  hotels: {
    luxury1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    luxury2: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    luxury3: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    beach1: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    beach2: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    city1: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    city2: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    resort1: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
    resort2: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
  },

  // Room Images
  rooms: {
    deluxe: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    suite: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
    standard: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
    penthouse: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
  },

  // Tourism/Landmarks Images
  tourism: {
    halong: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    hoian: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    sapa: "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800",
    danang: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
    nhatrang: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    dalat: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    phuquoc: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    hue: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
  },

  // Amenity Icons/Images
  amenities: {
    pool: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400",
    gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
    spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400",
    restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    wifi: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400",
    parking: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400",
  },

  // User Avatars
  avatars: {
    default: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200",
    user1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    user2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    user3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  },

  // Background Images
  backgrounds: {
    hero: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920",
    login: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1920",
    contact: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920",
  },

  // Placeholder
  placeholder: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&blur=10",
};

// Helper function to get image URL
export const getImageUrl = (category: keyof typeof mockImages, key: string): string => {
  const categoryImages = mockImages[category] as Record<string, string>;
  return categoryImages[key] || mockImages.placeholder;
};
