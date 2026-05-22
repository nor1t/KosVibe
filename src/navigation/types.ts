export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  MapTab: undefined;
  TavolinaTab: undefined;
  FavoritesTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Category: { category: 'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study' };
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
};

export type MapStackParamList = {
  MapMain: undefined;
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
};

export type TavolinaStackParamList = {
  TavolinaMain: undefined;
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
};

export type FavoritesStackParamList = {
  FavoritesMain: undefined;
  StoryDetail: { storyId: string };
  CreateStory: undefined;
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  History: undefined;
};
