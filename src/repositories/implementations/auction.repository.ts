import { SupabaseClient } from "@supabase/supabase-js";
import { Auction } from "../../db/entities/auction";
import { IAuctionRepository } from "../ports/auction.repository.port";

export default class AuctionRepository implements IAuctionRepository {
  constructor(private dbInstance: SupabaseClient) {}

  async getAuctionById(auctionId: number): Promise<Auction> {
    const result = await this.dbInstance
      .from("auctions")
      .select("*")
      .eq("id", auctionId);
    if (result.error || !result.data || result.data.length === 0) {
      throw new Error("Error");
    }
    return result.data[0] as Auction;
  }
}
