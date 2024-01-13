export type Coords = {
  latitude: number;
  longitude: number;
};

export type ReverseGeocodeResponse = {
  latitude: number;
  lookupSource: string;
  longitude: number;
  localityLanguageRequested: string;
  continent: string;
  continentCode: string;
  countryName: string;
  countryCode: string;
  principalSubdivision: string;
  principalSubdivisionCode: string;
  city: string;
  locality: string;
  postcode: string;
  plusCode: string;
  csdCode: string;
  localityInfo: LocalityInfo;
};

export type LocalityInfo = {
  administrative: Administrative[];
  informative: Informative[];
};

export type Administrative = {
  name: string;
  description: string;
  isoName?: string;
  order: number;
  adminLevel: number;
  isoCode?: string;
  wikidataId: string;
  geonameId?: number;
};

export type Informative = {
  name: string;
  description?: string;
  isoName?: string;
  order: number;
  isoCode?: string;
  wikidataId?: string;
  geonameId?: number;
};

export const getAddress = async ({
  latitude,
  longitude,
}: Coords): Promise<ReverseGeocodeResponse> => {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
  );
  if (!res.ok) throw Error('Failed getting address');

  const data = await res.json();
  return data;
};
