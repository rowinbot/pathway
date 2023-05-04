import { Injectable } from "@nestjs/common";
import { Match } from "../interfaces/match";
import { isMatchCodeValid } from "game-logic";

@Injectable()
export class MatchService {
  // Future: use redis to store matches state. currently this is local (in server memory).
  matches: Match[] = [];

  getMatchByCode(code: string) {
    if (!isMatchCodeValid(code)) {
      return null;
    }

    return this.matches.find((match) => match.code === code);
  }
}
