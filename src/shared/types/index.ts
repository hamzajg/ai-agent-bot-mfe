export interface User {
  id: string;
  email: string;
  shopName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Action {
  name: string;
  description: string;
  endpoint: string;
  method: 'GET' | 'POST';
  params?: Record<string, string>;
}

export type UsageEventType = 'message_sent' | 'action_called' | 'product_clicked' | 'error';

export type UsageEvent = {
  id: string;
  t: number;
  type: UsageEventType;
  meta: Record<string, any>;
};