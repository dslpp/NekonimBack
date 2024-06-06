const { User, sequelize } = require('./models/models');
const { Op } = require('sequelize');

const checkAccountActivation = async () => {
    try {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const usersToActivate = await User.findAll({
            where: {
                isActivated: false,
                createdAt: {
                    [Op.lt]: threeDaysAgo
                }
            }
        });

        for (const user of usersToActivate) {
            await user.destroy();
            console.log(`Аккаунт пользователя с email ${user.email} был удален из-за неактивации.`);
        }
    } catch (error) {
        console.error('Ошибка при проверке активации аккаунтов:', error);
    }
};

module.exports = checkAccountActivation;
