import { restaurantById, type Restaurant } from './mockData';

const nearbyVibesRestaurantIds = [
  'pishat',
  'sushi-bar-tokio',
  'pizza-napoli',
  'cafe-renaissance',
  'grill-house',
  'bar-metropol',
] as const;

export const nearbyVibesRestaurants = nearbyVibesRestaurantIds
  .map((restaurantId) => restaurantById[restaurantId])
  .filter((restaurant): restaurant is Restaurant => Boolean(restaurant));
