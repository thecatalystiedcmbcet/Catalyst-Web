//use this client only on server components or rest api files 

import {Client,Databases,Users,Storage} from 'node-appwrite'

const client = new Client()
.setEndpoint((process.env.NEXT_APPWRITE_ENDPOINT as string) || "https://cloud.appwrite.io/v1")
.setProject((process.env.NEXT_APPWRITE_PROJECT_ID as string) || "default")
.setKey((process.env.NEXT_APPWRITE_API_KEY as string) || "default")

export const database = new Databases(client)
export const users = new Users(client)
export const storage = new Storage(client)