module.exports = {
	client: 'postgres',
	connection: {
		multipleStatements: true,
		host: process.env.HOST,
		database: process.env.DATABASE,
		user: process.env.USERNAME,
		password: process.env.PASSWORD,
	},
	pool: {
		min: 2,
		max: 10,
	}
};