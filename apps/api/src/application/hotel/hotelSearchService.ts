import type { HotelRepository, HotelSearchQuery, HotelSearchResult } from "@/domain/hotel/hotel";

export class HotelSearchService {
  constructor(private readonly repo: HotelRepository) {}

  async search(query: HotelSearchQuery): Promise<HotelSearchResult[]> {
    if (!query.city || query.city.trim().length === 0) {
      throw new Error("city is required");
    }
    if (!query.checkIn || !query.checkOut) {
      throw new Error("checkIn/checkOut is required");
    }
    if (!Number.isFinite(query.guests) || query.guests <= 0) {
      throw new Error("guests must be > 0");
    }
    return this.repo.search({ ...query, city: query.city.trim() });
  }
}

