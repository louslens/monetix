import { queryOptions } from "@tanstack/react-query";
import { getPublicReviews, getPublicServices, getPublicSettings } from "@/lib/public.functions";

export const settingsQuery = queryOptions({
  queryKey: ["public-settings"],
  queryFn: () => getPublicSettings(),
  staleTime: 60_000,
});

export const servicesQuery = queryOptions({
  queryKey: ["public-services"],
  queryFn: () => getPublicServices(),
  staleTime: 60_000,
});

export const reviewsQuery = queryOptions({
  queryKey: ["public-reviews"],
  queryFn: () => getPublicReviews(),
  staleTime: 5 * 60_000,
});

export type PublicService = Awaited<ReturnType<typeof getPublicServices>>[number];
