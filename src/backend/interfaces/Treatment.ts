export interface Treatment {
  id: string;
  name: string;
  durations: { duration: number; price: number }[];
  discounts: {
    groupSize: number;
    prices: { [key: string]: number };
  };
}
