import React, { ReactElement } from "react";

export type AdditionalRequest = {
  description?: string;
  matchFieldName: string;
  url: string;
  method: string;
  headers: any;
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
  headers: any;
  method: string;
  data?: any;
  dataFormatter?: (arg1: string) => string;
  searchParam?: string;
  schemaParser: any;
  icon: ReactElement;
  firestoreKey: string;
  quadrant: number[];
  externalUrlFormatter: (arg1: any) => string;
  additionalRequest?: AdditionalRequest;
  ratingSource: RatingSource;
};

type RatingSource = {
  icon: string;
  name: string;
  normalized: boolean;
};
