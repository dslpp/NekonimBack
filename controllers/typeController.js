const { Type } = require('../models/models');
const ApiError = require('../error/ApiError');

class TypeController {
    async create(req, res) {
        const { name } = req.body;
        const type = await Type.create({ name });
        return res.json(type);
    }

    async getAll(req, res) {
        const types = await Type.findAll();
        return res.json(types);
    }

    async delete(req, res) {
        const { id } = req.params; 
        const type = await Type.findByPk(id);

        if (!type) {
            throw ApiError.NotFound(`Type with id ${id} not found`); 
        }

        await type.destroy(); 

        return res.json({ message: 'Type deleted successfully' }); 
    }
    async change(req, res) {
        const { id } = req.params;
        const { name } = req.body; 
    
        let type = await Type.findByPk(id);
    
        if (!type) {
            throw ApiError.NotFound(`Type with id ${id} not found`);
        }
        await type.update({ name });    
        return res.json(type);
    }
}

module.exports = new TypeController();
