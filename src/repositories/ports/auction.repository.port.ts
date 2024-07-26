import { Auction } from "../../db/entities/auction";

export interface IAuctionRepository {
  getAuctionById(auctionId: number): Promise<Auction>;
}
