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

  generateAccessToken(userId) {
    return this.signer.sign({ id: userId }, this.config.JWT_SECRET, {
      expiresIn: this.config.ACCESS_TOKEN_EXPIRY,
    });
  }

  generateRefreshToken(userId) {
    return this.signer.sign({ id: userId }, this.config.REFRESH_JWT_SECRET, {
      expiresIn: this.config.REFRESH_TOKEN_EXPIRY,
    });
  }

  verifyToken(token) {
    return this.signer.verify(token, this.config.JWT_SECRET);
  }

  verifyRefreshToken(token) {
    return this.signer.verify(token, this.config.REFRESH_JWT_SECRET);
  }
}

module.exports = AuthService;
