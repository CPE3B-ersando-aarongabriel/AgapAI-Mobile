export type RootServiceInfo = {
  service: string;
  environment: string;
  status: string;
};

export type HealthResponse = {
  status: "healthy" | string;
};
