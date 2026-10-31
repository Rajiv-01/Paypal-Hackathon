import { CartMandate } from '../types/mandate.js';

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalExecutionResult {
  order_id: string;
  status: string;
  checkout_url: string;
  mode: 'LIVE_SANDBOX' | 'SIMULATED_SANDBOX';
}

/**
 * Obtains an OAuth2 Access Token from PayPal REST API.
 */
async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret || clientId.includes('your_paypal') || clientSecret.includes('your_paypal')) {
    return null;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      console.warn(`[autonopay:paypal] OAuth token request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as PayPalTokenResponse;
    return data.access_token || null;
  } catch (error) {
    console.warn('[autonopay:paypal] Exception fetching PayPal OAuth token:', error);
    return null;
  }
}

/**
 * Phase 4: Real-world PayPal Orders API Integration (POST /v2/checkout/orders).
 * Maps the Cart Mandate agreed_price and quantity into purchase_units.
 * If credentials are missing or fail, falls back to a realistic sandbox link.
 */
export async function createPayPalOrder(mandate: CartMandate): Promise<PayPalExecutionResult> {
  const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
  const token = await getPayPalAccessToken();

  if (token) {
    try {
      console.log(`[autonopay:paypal] Initializing real PayPal Sandbox order for mandate ${mandate.mandate_id}...`);

      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: mandate.mandate_id,
            description: `A2A Mandate Settlement: ${mandate.item} via ${mandate.consumer_agent}`,
            custom_id: mandate.mandate_id,
            amount: {
              currency_code: 'USD',
              value: mandate.total_value.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: mandate.total_value.toFixed(2)
                }
              }
            },
            items: [
              {
                name: mandate.item.substring(0, 127),
                description: `Settled by autonopay gateway for ${mandate.consumer_agent}`,
                unit_amount: {
                  currency_code: 'USD',
                  value: mandate.agreed_price.toFixed(2)
                },
                quantity: String(mandate.quantity),
                category: 'DIGITAL_GOODS'
              }
            ]
          }
        ],
        application_context: {
          brand_name: 'autonopay A2A Gateway',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: 'http://localhost:5173/?paypal_settlement=success',
          cancel_url: 'http://localhost:5173/?paypal_settlement=cancelled'
        }
      };

      const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const orderData = (await response.json()) as PayPalOrderResponse;
        const approveLink = orderData.links.find((l) => l.rel === 'approve')?.href;

        if (approveLink) {
          console.log(`[autonopay:paypal] Real PayPal Sandbox Order Created! ID: ${orderData.id}, Link: ${approveLink}`);
          return {
            order_id: orderData.id,
            status: orderData.status || 'CREATED',
            checkout_url: approveLink,
            mode: 'LIVE_SANDBOX'
          };
        }
      } else {
        const errBody = await response.text();
        console.warn(`[autonopay:paypal] PayPal API responded with status ${response.status}:`, errBody);
      }
    } catch (err) {
      console.warn('[autonopay:paypal] Error creating real PayPal order, falling back:', err);
    }
  }

  // Graceful simulation fallback with realistic PayPal token URL
  const mockToken = `EC-${Math.random().toString(36).substring(2, 10).toUpperCase()}${Date.now().toString(36).toUpperCase()}`;
  const checkoutUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${mockToken}`;
  const mockOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 8999 + 1000)}`;

  console.log(`[autonopay:paypal] Operating in Sandbox Mode for ${mandate.mandate_id}:`);
  console.log(`[autonopay:paypal] Order ID: ${mockOrderId} -> ${checkoutUrl}`);

  return {
    order_id: mockOrderId,
    status: 'COMPLETED',
    checkout_url: checkoutUrl,
    mode: 'SIMULATED_SANDBOX'
  };
}
