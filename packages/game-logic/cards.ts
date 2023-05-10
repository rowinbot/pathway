import { TupleMatrix } from "./types";
import { v4 as uuid } from "uuid";

export enum BlackCardKind {
  Spades = "spades",
  Clover = "clover",
}

export enum RedCardKind {
  Hearts = "hearts",
  Diamonds = "diamonds",
}

type CardKind = BlackCardKind | RedCardKind;

export enum CardNumber {
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Ace = "A",
  SingleJack = "SJ",
  DoubleJack = "DJ",
  Queen = "Q",
  King = "K",
}

export type Card = {
  id: string;

  /**
   * Always unique id, even if card is exactly the same
   */
  uid: string;
  kind: CardKind;
  number: CardNumber;
  color: "red" | "black";
};

const cardId = (kind: CardKind, number: CardNumber) => `${kind}-${number}`;

export const cardKind = (card: Card) => card.kind;
export const cardNumber = (card: Card) => card.number;
export const cardColor = (card: Card) => card.color;

export function redCard(kind: RedCardKind, number: CardNumber) {
  return {
    id: cardId(kind, number),
    uid: uuid(),
    kind,
    number,
    color: "red",
  } satisfies Card;
}

export function blackCard(kind: BlackCardKind, number: CardNumber) {
  return {
    id: cardId(kind, number),
    uid: uuid(),
    kind,
    number,
    color: "black",
  } satisfies Card;
}

export function card(kind: CardKind, number: CardNumber) {
  if (kind === BlackCardKind.Clover || kind === BlackCardKind.Spades) {
    return blackCard(kind, number);
  } else {
    return redCard(kind, number);
  }
}

const EmptyCard = Symbol("EmptyCard");
export const isEmptyCard = (
  card: Card | typeof EmptyCard
): card is typeof EmptyCard => typeof card === "symbol";

// row-first cards matrix 10x10
export const staticBoardRows: TupleMatrix<
  TupleMatrix<Card | typeof EmptyCard, 10>,
  10
> = [
  [
    EmptyCard,
    card(RedCardKind.Diamonds, CardNumber.Six),
    card(RedCardKind.Diamonds, CardNumber.Seven),
    card(RedCardKind.Diamonds, CardNumber.Eight),
    card(RedCardKind.Diamonds, CardNumber.Nine),
    card(RedCardKind.Diamonds, CardNumber.Ten),
    card(RedCardKind.Diamonds, CardNumber.Queen),
    card(RedCardKind.Diamonds, CardNumber.King),
    card(RedCardKind.Diamonds, CardNumber.Ace),
    EmptyCard,
  ],
  [
    card(RedCardKind.Diamonds, CardNumber.Five),
    card(RedCardKind.Hearts, CardNumber.Three),
    card(RedCardKind.Hearts, CardNumber.Two),
    card(BlackCardKind.Spades, CardNumber.Two),
    card(BlackCardKind.Spades, CardNumber.Three),
    card(BlackCardKind.Spades, CardNumber.Four),
    card(BlackCardKind.Spades, CardNumber.Five),
    card(BlackCardKind.Spades, CardNumber.Six),
    card(BlackCardKind.Spades, CardNumber.Seven),
    card(BlackCardKind.Clover, CardNumber.Ace),
  ],
  [
    card(RedCardKind.Diamonds, CardNumber.Four),
    card(RedCardKind.Hearts, CardNumber.Four),
    card(RedCardKind.Diamonds, CardNumber.Queen),
    card(RedCardKind.Diamonds, CardNumber.Ace),
    card(BlackCardKind.Clover, CardNumber.Ace),
    card(BlackCardKind.Clover, CardNumber.King),
    card(BlackCardKind.Clover, CardNumber.Queen),
    card(BlackCardKind.Clover, CardNumber.Ten),
    card(BlackCardKind.Spades, CardNumber.Eight),
    card(BlackCardKind.Clover, CardNumber.King),
  ],
  [
    card(RedCardKind.Diamonds, CardNumber.Three),
    card(RedCardKind.Hearts, CardNumber.Five),
    card(RedCardKind.Diamonds, CardNumber.Queen),
    card(RedCardKind.Hearts, CardNumber.Queen),
    card(RedCardKind.Hearts, CardNumber.Ten),
    card(RedCardKind.Hearts, CardNumber.Nine),
    card(RedCardKind.Hearts, CardNumber.Eight),
    card(BlackCardKind.Clover, CardNumber.Nine),
    card(BlackCardKind.Spades, CardNumber.Nine),
    card(BlackCardKind.Clover, CardNumber.Queen),
  ],
  [
    card(RedCardKind.Diamonds, CardNumber.Two),
    card(RedCardKind.Hearts, CardNumber.Six),
    card(RedCardKind.Diamonds, CardNumber.Ten),
    card(RedCardKind.Hearts, CardNumber.King),
    card(RedCardKind.Hearts, CardNumber.Three),
    card(RedCardKind.Hearts, CardNumber.Two),
    card(RedCardKind.Hearts, CardNumber.Seven),
    card(BlackCardKind.Clover, CardNumber.Eight),
    card(BlackCardKind.Spades, CardNumber.Ten),
    card(BlackCardKind.Clover, CardNumber.Ten),
  ],
  [
    card(BlackCardKind.Spades, CardNumber.Ace),
    card(RedCardKind.Hearts, CardNumber.Seven),
    card(RedCardKind.Diamonds, CardNumber.Nine),
    card(RedCardKind.Hearts, CardNumber.Ace),
    card(RedCardKind.Hearts, CardNumber.Four),
    card(RedCardKind.Hearts, CardNumber.Five),
    card(RedCardKind.Hearts, CardNumber.Six),
    card(BlackCardKind.Clover, CardNumber.Seven),
    card(BlackCardKind.Spades, CardNumber.Queen),
    card(BlackCardKind.Clover, CardNumber.Nine),
  ],
  [
    card(BlackCardKind.Spades, CardNumber.King),
    card(RedCardKind.Hearts, CardNumber.Eight),
    card(RedCardKind.Diamonds, CardNumber.Eight),
    card(BlackCardKind.Clover, CardNumber.Two),
    card(BlackCardKind.Clover, CardNumber.Three),
    card(BlackCardKind.Clover, CardNumber.Four),
    card(BlackCardKind.Clover, CardNumber.Five),
    card(BlackCardKind.Clover, CardNumber.Six),
    card(BlackCardKind.Spades, CardNumber.King),
    card(BlackCardKind.Clover, CardNumber.Eight),
  ],
  [
    card(BlackCardKind.Spades, CardNumber.Queen),
    card(RedCardKind.Hearts, CardNumber.Nine),
    card(RedCardKind.Diamonds, CardNumber.Seven),
    card(RedCardKind.Diamonds, CardNumber.Six),
    card(RedCardKind.Diamonds, CardNumber.Five),
    card(RedCardKind.Diamonds, CardNumber.Four),
    card(RedCardKind.Diamonds, CardNumber.Three),
    card(RedCardKind.Diamonds, CardNumber.Two),
    card(BlackCardKind.Spades, CardNumber.Ace),
    card(BlackCardKind.Clover, CardNumber.Seven),
  ],
  [
    card(BlackCardKind.Spades, CardNumber.Ten),
    card(RedCardKind.Hearts, CardNumber.Ten),
    card(RedCardKind.Hearts, CardNumber.Queen),
    card(RedCardKind.Hearts, CardNumber.King),
    card(RedCardKind.Hearts, CardNumber.Ace),
    card(BlackCardKind.Clover, CardNumber.Two),
    card(BlackCardKind.Clover, CardNumber.Three),
    card(BlackCardKind.Clover, CardNumber.Four),
    card(BlackCardKind.Clover, CardNumber.Five),
    card(BlackCardKind.Clover, CardNumber.Six),
  ],
  [
    EmptyCard,
    card(BlackCardKind.Spades, CardNumber.Nine),
    card(BlackCardKind.Spades, CardNumber.Eight),
    card(BlackCardKind.Spades, CardNumber.Seven),
    card(BlackCardKind.Spades, CardNumber.Six),
    card(BlackCardKind.Spades, CardNumber.Five),
    card(BlackCardKind.Spades, CardNumber.Four),
    card(BlackCardKind.Spades, CardNumber.Three),
    card(BlackCardKind.Spades, CardNumber.Two),
    EmptyCard,
  ],
];

function isNotAJack(cardNumber: CardNumber): boolean {
  return (
    cardNumber !== CardNumber.SingleJack && cardNumber !== CardNumber.DoubleJack
  );
}

export function cardIsJack(card: Card): boolean {
  return !isNotAJack(card.number);
}

/**
 * Builds a card deck with all kinds and numbers twice except for jacks (single or double, which only appear once) - based on the game.
 */
export function getCards(): Card[] {
  const cards = [];

  for (const kind of Object.values(RedCardKind)) {
    for (const number of Object.values(CardNumber)) {
      cards.push(card(kind, number));
      if (isNotAJack(number)) cards.push(card(kind, number));
    }
  }

  for (const kind of Object.values(BlackCardKind)) {
    for (const number of Object.values(CardNumber)) {
      cards.push(card(kind, number));
      if (isNotAJack(number)) cards.push(card(kind, number));
    }
  }

  return cards;
}
