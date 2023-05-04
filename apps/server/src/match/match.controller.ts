import { Controller, Get, Param } from "@nestjs/common";
import { MatchService } from "./match.service";

@Controller("matches")
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get(":code")
  async list(@Param("code") code: string) {
    "hello";
    return await this.matchService.getMatchByCode(code);
  }
}
