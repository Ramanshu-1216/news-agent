import { v4 as uuidv4 } from "uuid";
import { Session, SessionInfo, ChatMessage } from "../../models";
import logger from "../utils/logger";

export class SessionService {
  private sessions: Map<string, Session> = new Map();

  createSession(): Session {
    const sessionId = uuidv4();
    const session: Session = {
      id: sessionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      messages: [],
    };

    this.sessions.set(sessionId, session);
    logger.info(`Created new session: ${sessionId}`);

    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionInfo(sessionId: string): SessionInfo | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    return {
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
    };
  }

  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).map((session) => ({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      messageCount: session.messages.length,
    }));
  }

  addMessage(sessionId: string, message: ChatMessage): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.messages.push(message);
    session.lastActivity = new Date();

    logger.info(`Added message to session ${sessionId}: ${message.role}`);
    return true;
  }

  getChatHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }

  clearSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.messages = [];
    session.lastActivity = new Date();

    logger.info(`Cleared session: ${sessionId}`);
    return true;
  }

  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      logger.info(`Deleted session: ${sessionId}`);
    }
    return deleted;
  }

  getActiveSessionCount(): number {
    return this.sessions.size;
  }
}

export const sessionService = new SessionService();
