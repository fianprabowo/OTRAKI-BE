import { BookingService } from "@/application/hotel/bookingService";
import { HotelDetailService } from "@/application/hotel/hotelDetailService";
import { HotelSearchService } from "@/application/hotel/hotelSearchService";
import { PaymentService } from "@/application/hotel/paymentService";
import { MockHotelRepository } from "@/infrastructure/mock/mockHotelRepository";
import { MemoryPaymentRepository } from "@/infrastructure/mock/memoryPaymentRepository";
import { MemoryQuoteRepository } from "@/infrastructure/mock/memoryQuoteRepository";

const hotelRepo = new MockHotelRepository();
const quoteRepo = new MemoryQuoteRepository();
const paymentRepo = new MemoryPaymentRepository();

const searchService = new HotelSearchService(hotelRepo);
const detailService = new HotelDetailService(hotelRepo);
const bookingService = new BookingService(quoteRepo);
const paymentService = new PaymentService(quoteRepo, paymentRepo);

export function hotelSearchService() {
  return searchService;
}

export function hotelDetailService() {
  return detailService;
}

export function bookingQuoteService() {
  return bookingService;
}

export function paymentProcessingService() {
  return paymentService;
}

export function quoteRepository() {
  return quoteRepo;
}

