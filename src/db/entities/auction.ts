export interface Auction {
  id: number;
  created_at: Date;
  league_id: string;
  player_name: string;
  bid: number;
  purchase_value: number;
  purchase_team: string;
  purchase_date: Date;
  ongoing: boolean;
  current_winning_team: string;
}
