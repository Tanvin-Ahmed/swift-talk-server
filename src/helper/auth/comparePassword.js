const bcrypt = require('bcrypt')

module.exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash)
}