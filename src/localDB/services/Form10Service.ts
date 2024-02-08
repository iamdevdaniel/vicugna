import { Form10Header } from 'vicugna-types'

import { insertDataToTable, queryDataFromTableById } from '../ConnectionManager'
import { createForm10HeaderTable } from '../TableDefinitions'

export const initForm10HeaderTable = async () => {
    try {
        const done = await createForm10HeaderTable()
        return done
    } catch (error) {
        console.log(error)
    }
}

export const createFormHeader = async (data: Form10Header) => {
    try {
        const userId = await insertDataToTable<Form10Header>(
            data,
            'Form10Header',
        )
        return userId
    } catch (error) {
        console.log(error)
    }
}

export const getFormHeaderById = async (headerId: number) => {
    try {
        const formHeader = await queryDataFromTableById(
            'Form10Header',
            headerId,
        )
        return formHeader
    } catch (error) {
        console.log(error)
    }
}
