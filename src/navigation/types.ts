export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type RootTabParamList = {
  HomeTab: undefined;
  MapTab: undefined;
  TavolinaTab: undefined;
  StoriesTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Market: undefined;
  Category: { category: 'Restaurants' | 'Hiking' | 'Party' | 'Culture' | 'Study' };
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
  Help: undefined;
  Exchange: undefined;
};

export type MapStackParamList = {
  MapMain: undefined;
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
  Help: undefined;
  Exchange: undefined;
};

export type TavolinaStackParamList = {
  TavolinaMain: undefined;
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
  Help: undefined;
  Exchange: undefined;
};

export type StoriesStackParamList = {
  StoriesMain: undefined;
  StoryDetail: { storyId: string };
  StorySearch: undefined;
  CreateStory: { editStoryId?: string } | undefined;
  RestaurantDetails: { restaurantId: string };
  BookTable: { restaurantId: string };
  Settings: undefined;
  History: undefined;
  Help: undefined;
  Exchange: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  FavoriteRestaurants: undefined;
  RestaurantDetails: { restaurantId: string };
  Settings: undefined;
  History: undefined;
  Help: undefined;
  Exchange: undefined;
};
