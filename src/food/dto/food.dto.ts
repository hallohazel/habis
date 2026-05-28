export class CreateFoodDto {
  name!: string;
  imageUrl!: string;
  stock!: number;
  originalPrice!: number;
  expiryTime!: string; // ISO string dari frontend (ex: "2026-05-24T18:00:00Z")
  pickupDeadline!: string;
}
