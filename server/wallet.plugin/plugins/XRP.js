const WalletInterface = require("../wallet.interface");
const cmd = require("../../services/commandline.utils");
const tatum = require("@tatumio/tatum");

const {
	FEE_TYPES,
	TRANSACTION_TYPES,
	TRANSACTION_STATUS,
	TRANSACTION_REASON
} = require("../../constants")
const serverFile = require("../../server");

const {
	v4: uuidv4
} = require("uuid");

let ManagerTransaction;
let boom;
serverFile.then((data) => {
	ManagerTransaction = data?.server?.HapiServer?.app.db.ManagerTransaction;
	boom = data?.server?.HapiServer?.app?.boom;
	Wallet = data?.server?.HapiServer?.app.db.Wallet;
})	

class XRPWallet extends WalletInterface {
	constructor() {
		super();
		this._name = "XRP";
		return this;
	}



	async getTransactionFee({
		amount,
		from,
		to
	}) {
		let {
			drops
		} = await this.Tatum.xrpGetFee();
		return drops.base_fee / 1000000
	}


	/**
	 *
	 * @returns {Promsie<CreateTatumAccountResponse>}
	 */
	async createTatumAccount() {
		/**
		 * @typedef CmdResponse
		 * @property {String} signatureId
		 * @property {String} xpub
		 */

		/**
		 * @type {CmdResponse}
		 */
		// let command = `tatum-kms generatemanagedwallet ${this.wallet.currency}`;
		// const { signatureId, xpub } = this.testnet
		//   ? await this.Tatum.generateWallet(this.wallet.currency, this.testnet)
		//   : await cmd(command);
		const {
			address: xpub
		} = await this.getWalletKeys()





		const account = await this.Tatum.createAccount({
				currency: this.wallet.currency,
				customer: {
					externalId: this.wallet.user_id || process.env.APP_NAME
				},
				xpub,
				accountingCurrency: "USD",
			},
			this.testnet
		);

		const address = await this.Tatum.generateDepositAddress(account.id)

		return {
			address,
			account
		};
	}

	/**
	 *
	 * @param {Number} quantity
	 * @param {String} address
	 */
	async transferToAddress({
		quantity,
		address,
		destination_tag = null
	}) {
		return
		let {
			address: account,
			secret
		} = await this.getWalletKeys()

		let {
			id,
			txId,
			completed
		} = await this.Tatum.sendXrpOffchainTransaction(this.testnet, {
			secret,
			address,
			senderAccountId: this.wallet.tatum_account_id,
			sourceTag: this.wallet.destination_tag,
			account,
			amount: String(quantity)
		})

		return {
			txId,
			id,
			completed
		}
	}





	/**
	 *
	 */
	async checkAndTransferToMasterAddress() {

		const wallet = this?.wallet;
		const user_id = wallet?.dataValues?.user_id;

		const depositEventFile = await require("../deposit.event");
		const {
			depositEmitFunc
		} = depositEventFile;

		let {
			address: account,
			secret,
			signatureId,
			masterAddress
		} = await this.getWalletKeys()
		let {
			availableBalance
		} = await this.Tatum.getAccountBalance(this.wallet.tatum_account_id)

		if (!masterAddress) {
			throw new Error(`there is no master address for ${this.wallet.currency}`)
		}

		// track new deposit from users
		let newDepositamount = Number(availableBalance) - (this.wallet.last_tatum_balance || 0)


		if (newDepositamount > 0) {
			this.wallet.total_success_deposit = this.wallet.total_success_deposit + newDepositamount

			// let { id = null, txId = null, completed = null } = res

			let date = new Date();
			date.setMinutes(date.getMinutes() + 5);
			this.wallet.next_check_deposit_date = date
			this.wallet.last_tatum_balance = Number(availableBalance);

			console.log(this.wallet.dataValues);
			console.log(newDepositamount);

			await this.wallet.save();

			// let transaction= null;
			let transaction = await this.wallet.createTransaction({
				quantity: Number(newDepositamount),
				type: TRANSACTION_TYPES.CREDIT,
				status: TRANSACTION_STATUS.ACTIVE,
				reason: TRANSACTION_REASON.DEPOSIT,
				metadata: {}
			})

			await this.wallet.updateBalance()
			depositEmitFunc(user_id, "XRP");

			return transaction;
		}


		return {
			status: "success"
		}
	}


	async MasterToManagerAddress(key, payload) {

		let {
			secret,
			signatureId,
			masterAddress
		} = key
		let balance = await tatum.xrpGetAccountBalance(masterAddress);

		let amountToTransfer = payload?.amount;

		if (!masterAddress) {
			throw new Error(`there is no master address for ${payload?.currency}`)
		}


		let user_wallet = null;
		let check_internal_wallet = await Wallet.findOne({
			where: {
				currency: payload?.currency,
				address: payload?.to
			},
		});

		if (check_internal_wallet && payload?.tag == '') {

			return boom.badRequest(
				"Required destination tag for internal user wallet"
			)
		}

		if (check_internal_wallet) {
			user_wallet = await Wallet.findOne({

				where: {
					currency: payload?.currency,
					address: payload?.to,
					destination_tag: payload?.tag.toString()
				},
			});

			if (!user_wallet) {
				return boom.badRequest(
					"Invalid destination tag"
				)
			}
		}




		if (user_wallet) {


			user_wallet.total_success_deposit = user_wallet.total_success_deposit + amountToTransfer

			// let { id = null, txId = null, completed = null } = res

			let date = new Date();
			date.setMinutes(date.getMinutes() + 5);
			user_wallet.next_check_deposit_date = date
			// user_wallet.last_tatum_balance = Number(availableBalance);

			console.log(user_wallet);

			// await user_wallet.save();

			let transaction_options = {
				address: payload?.to,
				quantity: Number(amountToTransfer),
				type: TRANSACTION_TYPES.DEBIT,
				status: TRANSACTION_STATUS.ACTIVE,
				reason: TRANSACTION_REASON.WITHDRAWAL,
				crypto: payload?.currency,
			}

			if (payload?.tag != '') {
				transaction_options.tag = payload?.tag.toString();
			}

			const transaction = await ManagerTransaction.create(transaction_options);

			await user_wallet.updateBalance()

			// depositEmitFunc(user_id, "XRP");

			return transaction
		} else {
			try {
				let fee = await this.getTransactionFee({
					from: masterAddress,
					to: payload?.to,
					amount: amountToTransfer
				});

				if (amountToTransfer > balance) {
					return boom.badRequest(
						"insufficient balance. "
					)
				} else {

					let params = {
						amount: String(amountToTransfer),
						fromAccount: masterAddress,
						fromSecret: secret,
						to: payload?.to,
						// destinationTag:Number(payload?.tag),
						// sourceTag:Number(this.wallet.destination_tag)
					}
					const destinationTag = Number(payload?.tag);
					if (destinationTag) {
						params.destinationTag = destinationTag;
					}

					let {
						id = null, txId = null, completed = null
					} = await tatum.sendXrpTransaction(params)

					console.log(id, txId, completed);

					let transaction_options = {
						address: payload?.to,
						fee: fee,
						quantity: Number(amountToTransfer),
						type: TRANSACTION_TYPES.DEBIT,
						status: TRANSACTION_STATUS.ACTIVE,
						reason: TRANSACTION_REASON.WITHDRAWAL,
						metadata: {
							txId,
							completed
						},
						crypto: payload?.currency,
					}

					if (payload?.tag != '') {
						transaction_options.tag = payload?.tag.toString();
					}

					const object = await ManagerTransaction.create(transaction_options);

					// return object;
					return {
						status: "success",
						data: object
					}
				}

				// return { status: "success from xrp"}

			} catch (err) {
				console.log(err);
				throw boom.badData(err.message, err);
			}
		}

		// return { status: "success" }
	}


	/**
	 *
	 * @returns {Promise<Any>} address
	 */
	async withdrawToAddress({
		amount,
		address,
		destinationTag = null
	}) {

		console.log("withdrawToAddress XRP call : ");

		let {
			secret,
			signatureId,
			masterAddress
		} = await this.getWalletKeys()
		await this.wallet.updateBalance()

		if (!masterAddress) {
			throw new Error(`there is no master address for ${this.wallet.currency}`)
		}

		return this.sequelize.transaction(async (t) => {

			let {
				id = null, txId = null, completed = null
			} = await this.Tatum.sendXrpTransaction({
				amount: String(amount),
				fromAccount: masterAddress,
				fromSecret: secret,
				to: address,
				destinationTag: Number(destinationTag),
				sourceTag: Number(this.wallet.destination_tag)

			})


			let transaction = await this.wallet.createTransaction({
				quantity: Number(amount),
				type: TRANSACTION_TYPES.DEBIT,
				status: TRANSACTION_STATUS.ACTIVE,
				reason: TRANSACTION_REASON.WITHDRAWAL,
				metadata: {
					txId,
					completed
				}
			}, {
				transaction: t
			})



			let chargeWallets, from;
			chargeWallets = {};

			
			// return chargeWallets;


			let ref = uuidv4();

			chargeWallets =
				(await this.wallet.getWalletsForTransactionFee({
					amount
				})) || {};

			console.log("chargeWallets : ",chargeWallets);	
			await this.wallet.createTransaction({	
				reference: ref,
				quantity: Number(chargeWallets.WITHDRAWAL.fee),
				type: TRANSACTION_TYPES.DEBIT,
				status: TRANSACTION_STATUS.ACTIVE,
				reason: TRANSACTION_REASON.FEES,
			}, {
				transaction: t
			});


			await this.wallet.updateBalance()
			return transaction

		})

	}

}

module.exports = XRPWallet;