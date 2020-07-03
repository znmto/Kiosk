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
