module.exports = {
	client: 'pg',
	connection: {
		multipleStatements: true,
		host: process.env.SOCKET_PATH,
		database: process.env.DATABASE,
		user: process.env.USERNAME,
		password: process.env.PASSWORD,
	},
	pool: {
		min: 2,
		max: 10,
	}
};