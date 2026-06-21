import { createContext } from "svelte";

export const [getSessionContext, setSessionContext] = createContext<App.Locals["session"]>();

export const [getUserContext, setUserContext] = createContext<App.Locals["user"]>();
