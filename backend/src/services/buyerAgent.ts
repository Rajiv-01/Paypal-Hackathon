/**
 * buyerAgent.ts
 * Client-side buyer bot negotiation engine.
 * Mirrors merchantAgent.ts but from the buyer's perspective.
 * Uses deterministic strategy-based mock (with local LLM hook).
 */

import { BotStrategy } from '../types/session.js';

interface BuyerNegotiationResult {
  offer_price: number;   // What the bot is bidding
  accepted: boolean;     // Did the bot accept the merchant counter?
  message: string;       // The chat message text
  final: boolean;        // Is this the last message (deal done or walk away)?
}

interface MerchantCounter {
  counter_price: number;
  message: string;
}

/**
 * Generates the buyer bot's opening bid message.
 */
export function generateOpeningBid(params: {
  bot_name: string;
  item: string;
  requested_price: number;
  quantity: number;
  strategy: BotStrategy;
}): BuyerNegotiationResult {
  const { bot_name, item, requested_price, quantity, strategy } = params;

  // Aggressive bots bid lower; conservative bids at ask
  const bidMultiplier =
    strategy === 'AGGRESSIVE' ? 0.88 : strategy === 'BALANCED' ? 0.93 : 0.98;
  const offer = Math.round(requested_price * bidMultiplier * 100) / 100;

  const messages: Record<BotStrategy, string> = {
    AGGRESSIVE: `Initiating procurement for ${quantity} units of "${item}". Opening offer: $${offer.toFixed(2)}/unit. We expect favorable terms.`,
    BALANCED:   `Hello Autonopay Merchant. Requesting ${quantity} units of "${item}" at $${offer.toFixed(2)}/unit. Please consider our volume.`,
    CONSERVATIVE: `Greetings. I am looking to purchase ${quantity} units of "${item}". My offer is $${offer.toFixed(2)}/unit — this is aligned with market rates.`,
  };

  return {
    offer_price: offer,
    accepted: false,
    message: messages[strategy],
    final: false,
  };
}

/**
 * Buyer bot evaluates a merchant counter-offer and decides to accept or counter.
 */
export function evaluateMerchantCounter(params: {
  bot_name: string;
  item: string;
  strategy: BotStrategy;
  original_ask: number;
  counter_price: number;
  budget_cap: number;
  price_buffer_pct: number;
  quantity: number;
  round: number;
}): BuyerNegotiationResult {
  const {
    bot_name, item, strategy, original_ask,
    counter_price, budget_cap, price_buffer_pct, quantity, round,
  } = params;

  const totalAtCounter = counter_price * quantity;
  const maxAcceptable  = original_ask * (1 + price_buffer_pct / 100);
  const overBudget     = totalAtCounter > budget_cap;

  // Walk away if over budget
  if (overBudget) {
    return {
      offer_price: counter_price,
      accepted: false,
      message: `Total at $${counter_price.toFixed(2)}/unit ($${totalAtCounter.toFixed(2)}) exceeds our allocated budget of $${budget_cap.toFixed(2)}. We must withdraw this request.`,
      final: true,
    };
  }

  // Acceptance logic by strategy
  const withinBuffer = counter_price <= maxAcceptable;

  if (strategy === 'CONSERVATIVE') {
    if (withinBuffer) {
      return accept(counter_price, item, quantity);
    }
    // Conservative walks away if merchant doesn't budge within 1 round
    if (round >= 1) {
      return {
        offer_price: counter_price,
        accepted: false,
        message: `The counter of $${counter_price.toFixed(2)}/unit exceeds our pricing threshold. Unable to proceed. Closing session.`,
        final: true,
      };
    }
  }

  if (strategy === 'BALANCED') {
    if (withinBuffer || round >= 1) {
      return accept(counter_price, item, quantity);
    }
    // Try one counter at midpoint
    const mid = Math.round(((original_ask + counter_price) / 2) * 100) / 100;
    return {
      offer_price: mid,
      accepted: false,
      message: `We appreciate the counter. We can meet at $${mid.toFixed(2)}/unit — splitting the difference. Final offer from our side.`,
      final: false,
    };
  }

  // AGGRESSIVE: counter harder, accept only after ≥ 2 rounds or if near buffer
  if (strategy === 'AGGRESSIVE') {
    if (withinBuffer && round >= 1) {
      return accept(counter_price, item, quantity);
    }
    if (round >= 2) {
      // Accept anyway after 2 rounds to close the deal
      return accept(counter_price, item, quantity);
    }
    const aggressive_counter = Math.round(original_ask * 0.92 * 100) / 100;
    return {
      offer_price: aggressive_counter,
      accepted: false,
      message: `Our cost model doesn't support $${counter_price.toFixed(2)}. Counter: $${aggressive_counter.toFixed(2)}/unit. This is our ceiling.`,
      final: false,
    };
  }

  return accept(counter_price, item, quantity);
}

function accept(price: number, item: string, quantity: number): BuyerNegotiationResult {
  const total = price * quantity;
  return {
    offer_price: price,
    accepted: true,
    message: `Counter-offer evaluated and accepted. Committing to $${price.toFixed(2)}/unit × ${quantity} units = $${total.toFixed(2)}. Proceeding to payment authorization.`,
    final: true,
  };
}
