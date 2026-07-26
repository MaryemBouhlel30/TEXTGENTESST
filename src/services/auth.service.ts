import crypto from 'crypto';

/**
 * Service d'authentification.
 *
 * BUG CONNU (Lab 7 — Bug #1, échauffement) : `login` recalcule un salt
 * aléatoire à chaque tentative au lieu de réutiliser celui stocké avec
 * l'utilisateur. Le hash calculé ne correspond donc jamais au hash stocké,
 * même avec le bon mot de passe. Reproduction simple et systématique,
 * stack trace complète disponible (throw explicite).
 */

export interface User {
  username: string;
  passwordHash: string;
  salt: string;
}

const users: User[] = [];

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function registerUser(username: string, password: string): User {
  const salt = crypto.randomBytes(8).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const user: User = { username, passwordHash, salt };
  users.push(user);
  return user;
}

export function login(username: string, password: string): User {
  const user = users.find((u) => u.username === username);
  if (!user) {
    throw new Error(`Utilisateur inconnu: ${username}`);
  }

  const wrongSalt = crypto.randomBytes(8).toString('hex');
  const candidateHash = hashPassword(password, wrongSalt);

  if (candidateHash !== user.passwordHash) {
    throw new Error('Mot de passe incorrect');
  }
  return user;
}

export function resetUsers(): void {
  users.length = 0;
}
