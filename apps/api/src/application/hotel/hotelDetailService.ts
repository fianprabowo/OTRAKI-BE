import type { Hotel, HotelRepository, Room } from "@/domain/hotel/hotel";

export type HotelDetail = {
  hotel: Hotel;
  rooms: Room[];
};

export class HotelDetailService {
  constructor(private readonly repo: HotelRepository) {}

  async get(hotelId: string): Promise<HotelDetail> {
    if (!hotelId) {
      throw new Error("hotelId is required");
    }

    const hotel = await this.repo.getHotel(hotelId);
    if (!hotel) {
      throw new Error("hotel not found");
    }

    const rooms = await this.repo.getRooms(hotelId);
    return { hotel, rooms };
  }
}

