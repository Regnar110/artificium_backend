import { Collection, MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.ATLAS_URI as string;

if (!uri) {
  throw new Error('Add Mongo URI to .env.local');
}

type Client = {userId:string, socketId:string}
type SocketClients = Client[]

class SocketClientState {
    private static state: SocketClients = []
    private constructor() {}

    public static getState(): SocketClients {
      return SocketClientState.state
    }

    public static addClient(client:Client):void {
        SocketClientState.state = [...this.state, client]
        console.log(SocketClientState.state)
    } 

    public static removeClient(socketId:string) {
        const newState = SocketClientState.state.filter(client => client.socketId !== socketId)
        SocketClientState.state = newState
        console.log(SocketClientState.state)
    }

    public static findClient(clientId:string):Client | undefined {

      return SocketClientState.state.filter(client => client.userId === clientId)[0]
    }
}

export default SocketClientState

export const {addClient, removeClient, findClient, getState} = SocketClientState