import type { Hotel, HotelRepository, HotelSearchQuery, HotelSearchResult, Room } from "@/domain/hotel/hotel";

const hotels: Hotel[] = [
  {
    id: "h-jkt-1",
    name: "Sudirman Skyline Hotel",
    city: "Jakarta",
    address: "Jl. Jend. Sudirman No. 11, Jakarta",
    rating: 4.6,
    reviewCount: 1287,
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20luxury%20city%20hotel%20in%20Jakarta%20with%20skyline%20view%2C%20blue%20hour%2C%20premium%20travel%20photography%2C%20high%20detail%2C%2016%3A9&image_size=landscape_16_9",
    amenities: ["WiFi", "Pool", "Gym", "Breakfast", "Parking"],
  },
  {
    id: "h-jkt-2",
    name: "Menteng Heritage Stay",
    city: "Jakarta",
    address: "Jl. Menteng Raya No. 7, Jakarta",
    rating: 4.2,
    reviewCount: 642,
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=boutique%20heritage%20hotel%20in%20Menteng%20Jakarta%2C%20elegant%20facade%2C%20warm%20lighting%2C%20premium%20travel%20photography%2C%20high%20detail%2C%2016%3A9&image_size=landscape_16_9",
    amenities: ["WiFi", "Breakfast", "Restaurant"],
  },
  {
    id: "h-bdg-1",
    name: "Dago Hills Boutique",
    city: "Bandung",
    address: "Jl. Dago Atas No. 21, Bandung",
    rating: 4.5,
    reviewCount: 901,
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=boutique%20hotel%20in%20Bandung%20with%20lush%20green%20hills%2C%20morning%20mist%2C%20calm%20pastel%20blue%20sky%2C%20premium%20travel%20photography%2C%20high%20detail%2C%2016%3A9&image_size=landscape_16_9",
    amenities: ["WiFi", "Mountain View", "Breakfast", "Parking"],
  },
  {
    id: "h-dps-1",
    name: "Seminyak Ocean Breeze",
    city: "Bali",
    address: "Jl. Pantai Seminyak No. 3, Bali",
    rating: 4.7,
    reviewCount: 2104,
    imageUrl:
      "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20beachfront%20resort%20in%20Seminyak%20Bali%2C%20infinity%20pool%2C%20palm%20trees%2C%20sunset%2C%20premium%20travel%20photography%2C%20high%20detail%2C%2016%3A9&image_size=landscape_16_9",
    amenities: ["WiFi", "Beachfront", "Pool", "Spa", "Breakfast"],
  },
];

const rooms: Room[] = [
  {
    id: "r-std-1",
    hotelId: "h-jkt-1",
    name: "Deluxe King Room",
    refundable: true,
    breakfastIncluded: true,
    pricePerNight: { currency: "IDR", amount: 950000 },
  },
  {
    id: "r-std-2",
    hotelId: "h-jkt-1",
    name: "Twin Room",
    refundable: false,
    breakfastIncluded: false,
    pricePerNight: { currency: "IDR", amount: 750000 },
  },
  {
    id: "r-mtg-1",
    hotelId: "h-jkt-2",
    name: "Heritage Queen",
    refundable: true,
    breakfastIncluded: false,
    pricePerNight: { currency: "IDR", amount: 680000 },
  },
  {
    id: "r-dago-1",
    hotelId: "h-bdg-1",
    name: "Panoramic Suite",
    refundable: true,
    breakfastIncluded: true,
    pricePerNight: { currency: "IDR", amount: 820000 },
  },
  {
    id: "r-seminyak-1",
    hotelId: "h-dps-1",
    name: "Ocean View Villa",
    refundable: false,
    breakfastIncluded: true,
    pricePerNight: { currency: "IDR", amount: 1650000 },
  },
];

function findRooms(hotelId: string) {
  return rooms.filter((r) => r.hotelId === hotelId);
}

export class MockHotelRepository implements HotelRepository {
  async search(query: HotelSearchQuery): Promise<HotelSearchResult[]> {
    const city = query.city.toLowerCase();
    const filtered = hotels.filter((h) => h.city.toLowerCase().includes(city));
    return filtered.map((hotel) => {
      const rs = findRooms(hotel.id);
      const lowest = rs.reduce((min, r) => (r.pricePerNight.amount < min ? r.pricePerNight.amount : min), rs[0]?.pricePerNight.amount ?? 0);
      return {
        hotel,
        lowestPricePerNight: { currency: "IDR", amount: lowest },
      };
    });
  }

  async getHotel(hotelId: string): Promise<Hotel | null> {
    return hotels.find((h) => h.id === hotelId) ?? null;
  }

  async getRooms(hotelId: string): Promise<Room[]> {
    return findRooms(hotelId);
  }
}
