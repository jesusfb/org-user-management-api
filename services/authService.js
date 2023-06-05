class AuthService {
  constructor(hasher, signer, config) {
    this.hasher = hasher;
    this.signer = signer;
    this.config = config;
  }

  hashPassword(password) {
    return this.hasher.hashSync(password, 8);
  }

  checkPassword(password, hashedPassword) {
    return this.hasher.compareSync(password, hashedPassword);
  }

  generateToken(userId) {
    return this.signer.sign({ id: userId }, this.config.JWT_SECRET, {
      expiresIn: this.config.SESSION_EXPIRY,
    });
  }
}

module.exports = AuthService;
