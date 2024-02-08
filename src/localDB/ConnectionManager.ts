import { openDatabase } from 'expo-sqlite'

const db = openDatabase('vicugna-db')

export const insertDataToTable = <T extends object>(
    data: T,
    tableName: string,
) => {
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => '?').join(', ')

    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `INSERT INTO ${tableName} ${keys.join(', ')}
                VALUES (${placeholders})`,
                values,
                (_, resultSet) => resolve(resultSet.insertId),
                (_, error) => {
                    reject(error)
                    return true
                },
            )
        })
    })
}

export const queryDataFromTableById = (tableName: string, id: number) =>
    new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM ${tableName} WHERE id = ?`,
                [id],
                (_, resultSet) => resolve(resultSet.rows._array),
                (_, resultSet) => {
                    reject(resultSet)
                    return true
                },
            )
        })
    })
