import { openDatabase } from 'expo-sqlite'

const db = openDatabase('vicugna-db')

export const createForm10HeaderTable = () =>
    new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS Form10Header (
                    id INTEGER PRIMARY KEY NOT NULL,
                    creationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    department TEXT NOT NULL,
                    regional TEXT NOT NULL,
                    community TEXT NOT NULL,
                    captureSite TEXT NOT NULL,
                    latitude TEXT NOT NULL,
                    longitude TEXT NOT NULL,
                    captureDate TEXT NOT NULL,
                    herdingAttempts TEXT NOT NULL,
                    authorizationCode TEXT NOT NULL
                )`,
                [],
                _ => resolve(true),
                (_, error) => {
                    reject(error)
                    return true
                },
            )
        })
    })
