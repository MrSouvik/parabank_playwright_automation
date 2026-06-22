export interface UserCredentials {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
}

export class ScenarioContext {
  private static instance: ScenarioContext;
  private context: Map<string, unknown> = new Map();

  private constructor() {}

  static getInstance(): ScenarioContext {
    if (!ScenarioContext.instance) {
      ScenarioContext.instance = new ScenarioContext();
    }
    return ScenarioContext.instance;
  }

  set<T>(key: string, value: T): void {
    this.context.set(key, value);
  }

  get<T>(key: string): T {
    if (!this.context.has(key)) {
      throw new Error(`ScenarioContext: Key "${key}" not found. Ensure previous steps have set this value.`);
    }
    return this.context.get(key) as T;
  }

  has(key: string): boolean {
    return this.context.has(key);
  }

  clear(): void {
    this.context.clear();
  }
}
