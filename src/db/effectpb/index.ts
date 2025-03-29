import { Effect, Layer, Context, Logger } from 'effect'
import PocketBase from 'pocketbase'
import { config } from '../../config'

const make = {
	/**
	 * Provides an authenticed PocketBase client connection and the corresponding auth token
	 * @error PocketBase: ClientResponseError
	 */
	connection: Effect.gen(function* () {
		const pb = yield* Effect.succeed(new PocketBase(config.PB_URL))
		const authReturn = yield* Effect.tryPromise(() =>
			pb
				.collection('_superuser')
				.authWithPassword(config.SUPERUSER_EMAIL, config.SUPERUSER_PASS),
		)
		console.log(`Token: ${authReturn.token}`)
		Effect.logDebug(
			`Database connection... \n\t-> Token: ${authReturn.token}\n\t-> Record: ${authReturn.record}`,
		)
		return { pb: pb, token: authReturn.token }
	}),
}

export class PB extends Context.Tag('PocketBase')<PB, typeof make>() {
	static Live = Layer.succeed(this, make)
}
