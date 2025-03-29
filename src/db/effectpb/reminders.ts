import { config } from '../../config'
import { Effect, Context, Layer } from 'effect'
import PocketBase from 'pocketbase'
import { PB } from '.'

const make = {
	/**
	 * Testing use of underlying PocketBase service layer for retrieving PocketBase connection
	 * @returns
	 */
	depTest: () =>
		Effect.gen(function* () {
			// Isn't this the most vile thing you've ever fucking seen?
			const { pb } = yield* (yield* PB).connection
			const record = pb.collection('reminders').getOne('')
		}),
	getReminderById: (id: string) =>
		Effect.gen(function* () {
			const _pb = yield* Effect.succeed(new PocketBase(config.PB_URL))
			const { pb } = yield* (yield* PB).connection

			const reminder = yield* Effect.tryPromise(() =>
				_pb.collection('reminders').getOne(id),
			)
			return reminder
		}),
	getAllReminders: () =>
		Effect.gen(function* () {
			const _pb = yield* (yield* PB).connection
			const pb = yield* Effect.succeed(new PocketBase(config.PB_URL))
			const res = yield* Effect.tryPromise(() =>
				pb.collection('reminders').getFullList(),
			)
			return res
		}),

	createReminder: (
		userId: string,
		channelId: string,
		reminderName: string,
		remindAt: number,
	) =>
		Effect.gen(function* () {
			const _pb = yield* (yield* PB).connection
			const pb = yield* Effect.succeed(new PocketBase(config.PB_URL))
			const res = yield* Effect.tryPromise(() =>
				pb.collection('reminders').create({
					userId,
					channelId,
					reminderName,
					remindAt,
				}),
			)
			return res
		}),
	deleteReminder: (id: string) =>
		Effect.gen(function* () {
			const _pb = yield* (yield* PB).connection
			const pb = yield* Effect.succeed(new PocketBase(config.PB_URL))
			const res = yield* Effect.tryPromise(() =>
				pb.collection('reminders').delete(id),
			)
			return res
		}),
}
class ReminderStore extends Context.Tag('ReminderStore')<
	ReminderStore,
	typeof make
>() {
	static Live = Layer.succeed(this, make)
}
