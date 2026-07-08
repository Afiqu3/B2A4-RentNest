import { RentalRequestStatus } from "../../../generated/prisma/enums";

export interface IRentalRequest {
  moveInDate: string;
  durationMonths?: number;
}

export interface IRentalRequestUpdate {
  status: RentalRequestStatus;
}
