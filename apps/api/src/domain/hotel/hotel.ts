export type Money = {
  currency: "IDR";
  amount: number;
};

export type Hotel = {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  amenities: string[];
};

export type Room = {
  id: string;
  hotelId: string;
  name: string;
  refundable: boolean;
  breakfastIncluded: boolean;
  pricePerNight: Money;
};

export type HotelSearchQuery = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type HotelSearchResult = {
  hotel: Hotel;
  lowestPricePerNight: Money;
};

export interface HotelRepository {
  search(query: HotelSearchQuery): Promise<HotelSearchResult[]>;
  getHotel(hotelId: string): Promise<Hotel | null>;
  getRooms(hotelId: string): Promise<Room[]>;
}

