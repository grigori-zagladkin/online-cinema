import { Injectable } from '@nestjs/common'
import { getTelegramConfig } from 'src/config/telegram.config'
import { Telegraf } from 'telegraf'
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'
import { Telegramm } from './telegramm.interface'

@Injectable()
export class TelegrammService {
	bot: Telegraf
	options: Telegramm

	constructor() {
		this.options = getTelegramConfig()
		this.bot = new Telegraf(this.options.token)
	}

	async sendMessages(
		msg: string,
		options?: ExtraReplyMessage,
		chatId: string = this.options.chatId
	) {
		await this.bot.telegram.sendMessage(chatId, msg, {
			parse_mode: 'HTML',
			...options,
		})
	}

	async sendPhoto(
		photo: string,
		msg?: string,
		chatId: string = this.options.chatId
	) {
		await this.bot.telegram.sendPhoto(chatId, photo, {
			caption: msg,
		})
	}
}
