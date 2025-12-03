export type GoogleProfile = {
  id: string;
  name: GoogleName;
  emails: ValueField[];
  photos: ValueField[];
};

type GoogleName = {
  givenName: string;
  familyName: string;
};

type ValueField = {
  value: string;
};
