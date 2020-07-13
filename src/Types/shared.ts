import React from "react";

type Headers = {
  [key: string]: string;
};

type RatingSource = {
  icon: string;
  name: string;
  normalized: boolean;
};

type InterpolatableValue = {
  id?: string;
  isbn13?: string;
  url?: string;
};

export type InterpolatableObject = {
  value: InterpolatableValue;
};

export type AdditionalRequest = {
  description?: string;
  matchFieldName: string;
  url: string;
  method: string;
  headers: Headers;
  data?: any;
};

export type MatchesParams = {
  showOnly?: string;
};

export type PublicViewParam = {
  publicUid?: string;
};

export type Media = {
  label: string;
  url: string;
  headers: Headers;
  method: string;
  data?: any;
  dataFormatter?: (arg1: string) => string;
  searchParam?: string;
  schemaParser: (arg1: any) => any;
  icon: React.ReactElement;
  firestoreKey: string;
  quadrant: number[];
  externalUrlFormatter: (arg1: InterpolatableObject) => string;
  additionalRequest?: AdditionalRequest;
  ratingSource: RatingSource;
};
