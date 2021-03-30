interface User {
  email: string;
  name: string;
  city: string;
  country: string;
}

type UserDBItem = User & { pk: string; sk: string };

type UserTypes = 'profile';
