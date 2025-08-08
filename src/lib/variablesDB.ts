export interface Variable {
  id: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

class VariablesDB {
  private dbName = 'HatchtTestDB';
  private version = 1;
  private storeName = 'variables';

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: true });
        }
      };
    });
  }

  async getAllVariables(): Promise<Variable[]> {
    await this.init();
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getAllRequest = store.getAll();

        getAllRequest.onerror = () => reject(getAllRequest.error);
        getAllRequest.onsuccess = () => {
          const variables = getAllRequest.result.map((variable: any) => ({
            ...variable,
            createdAt: new Date(variable.createdAt),
            updatedAt: new Date(variable.updatedAt)
          }));
          resolve(variables);
        };
      };
    });
  }

  async addVariable(variable: Omit<Variable, 'id' | 'createdAt' | 'updatedAt'>): Promise<Variable> {
    await this.init();
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const newVariable: Variable = {
          ...variable,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const addRequest = store.add(newVariable);

        addRequest.onerror = () => reject(addRequest.error);
        addRequest.onsuccess = () => resolve(newVariable);
      };
    });
  }

  async updateVariable(id: string, updates: Partial<Omit<Variable, 'id' | 'createdAt'>>): Promise<Variable> {
    await this.init();
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const getRequest = store.get(id);
        
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
          const existingVariable = getRequest.result;
          if (!existingVariable) {
            reject(new Error('Variable not found'));
            return;
          }

          const updatedVariable: Variable = {
            ...existingVariable,
            ...updates,
            updatedAt: new Date()
          };

          const putRequest = store.put(updatedVariable);
          
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve(updatedVariable);
        };
      };
    });
  }

  async deleteVariable(id: string): Promise<void> {
    await this.init();
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const deleteRequest = store.delete(id);

        deleteRequest.onerror = () => reject(deleteRequest.error);
        deleteRequest.onsuccess = () => resolve();
      };
    });
  }

  async getVariableByName(name: string): Promise<Variable | null> {
    await this.init();
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('name');
        
        const getRequest = index.get(name);

        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => {
          const variable = getRequest.result;
          if (variable) {
            resolve({
              ...variable,
              createdAt: new Date(variable.createdAt),
              updatedAt: new Date(variable.updatedAt)
            });
          } else {
            resolve(null);
          }
        };
      };
    });
  }
}

export const variablesDB = new VariablesDB();
