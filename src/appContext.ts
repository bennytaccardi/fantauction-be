import { dbInstance } from "./db/init";
import AuctionRepository from "./repositories/implementations/auction.repository";
import { IAuctionRepository } from "./repositories/ports/auction.repository.port";

const auctionRepository: IAuctionRepository = new AuctionRepository(dbInstance);

export const appContext = {
  repositories: {
    auctionRepository,
  },
};
