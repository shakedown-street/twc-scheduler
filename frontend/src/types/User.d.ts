type User = {
  id: string;
  last_login: string | null;
  is_superuser: boolean;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  image: string | null;
  date_joined: string;
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;

  hover_cards_enabled: boolean;
};
