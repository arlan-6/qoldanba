type PushSubscriptionKeys = {
  p256dh?: string;
  auth?: string;
};

type PushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: PushSubscriptionKeys;
};

type WebPush = {
  setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  sendNotification(subscription: PushSubscription, payload: string): Promise<void>;
};

declare module "npm:web-push@3.6.7" {
  const webpush: WebPush;
  export default webpush;
}

type PostgrestError = {
  message: string;
  code?: string;
};

type PostgrestResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

type PostgrestFilterBuilder<T> = Promise<PostgrestResponse<T[]>> & {
  eq(column: string, value: string): PostgrestFilterBuilder<T>;
  in(column: string, values: string[]): PostgrestFilterBuilder<T>;
  gte(column: string, value: string): PostgrestFilterBuilder<T>;
  lt(column: string, value: string): PostgrestFilterBuilder<T>;
};

type PostgrestQueryBuilder<T> = {
  select(columns?: string): PostgrestFilterBuilder<T>;
  insert(values: Record<string, unknown>): Promise<PostgrestResponse<null>>;
  delete(): PostgrestFilterBuilder<T>;
};

type SupabaseClient = {
  from<T = Record<string, unknown>>(table: string): PostgrestQueryBuilder<T>;
};

declare module "https://esm.sh/@supabase/supabase-js@2.91.0" {
  export const createClient: (
    url: string,
    key: string,
    options?: { auth?: { persistSession?: boolean } }
  ) => SupabaseClient;
}

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
};
