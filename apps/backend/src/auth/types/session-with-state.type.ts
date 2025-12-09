import { Session } from 'express-session';

export type SessionWithState = Session & {
  state: string;
};
