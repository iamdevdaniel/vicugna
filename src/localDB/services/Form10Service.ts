import { Form10Header } from 'vicugna-types'

import {
    insertDataToTable,
    queryAllDataFromTable,
    queryDataFromTableById,
} from '../ConnectionManager'
import { createForm10HeaderTable } from '../TableDefinitions'

export const initForm10HeaderTable = async () => {
    try {
        const done = await createForm10HeaderTable()
        return done
    } catch (error) {
        console.log('Error when initializing Form10Header table:', error)
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
        console.log('Error when creating a new Form10Header:', error)
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
        console.log('Error when retrieving a Form10Header by id:', error)
    }
}

export const getAllFormHeaders = async (): Promise<Form10Header[]> => {
    try {
        const headers =
            await queryAllDataFromTable<Form10Header>('Form10Header')
        return headers
    } catch (error) {
        console.log('Error when retrieving all Form10Header', error)
        return []
    }
}
